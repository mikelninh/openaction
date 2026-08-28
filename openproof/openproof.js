/* OpenProof v0.1 — selective attestation core.
 *
 * Security boundary:
 * - This local backend uses Ed25519 issuer signatures + SHA-256 commitments.
 * - Private claims never appear in the proof unless explicitly disclosed.
 * - Predicate results are issuer-attested, not zero-knowledge proven.
 * - A Midnight/Compact backend can replace issuer-trusted predicate evaluation
 *   with ZK verification while preserving the public proof envelope.
 */
const crypto = require('node:crypto');

const VERSION = 'openproof/0.1';
const BACKEND = 'ed25519-selective-attestation-v0';

function canonical(value) {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`;
  return `{${Object.keys(value).sort().map(k => `${JSON.stringify(k)}:${canonical(value[k])}`).join(',')}}`;
}

function sha256(value) {
  return crypto.createHash('sha256').update(typeof value === 'string' ? value : canonical(value)).digest('hex');
}

function getPath(obj, path) {
  return String(path).split('.').reduce((acc, key) => (acc == null ? undefined : acc[key]), obj);
}

function evaluate(actual, predicate, now = new Date()) {
  switch (predicate.op) {
    case 'eq': return actual === predicate.value;
    case 'gte': return typeof actual === 'number' && actual >= predicate.value;
    case 'lte': return typeof actual === 'number' && actual <= predicate.value;
    case 'in': return Array.isArray(predicate.value) && predicate.value.includes(actual);
    case 'present': return actual !== undefined && actual !== null && actual !== '';
    case 'contains': return Array.isArray(actual) && actual.includes(predicate.value);
    case 'not_expired': {
      const t = Date.parse(actual);
      return Number.isFinite(t) && t >= now.getTime();
    }
    default: throw new Error(`unsupported predicate op: ${predicate.op}`);
  }
}

function evaluatePredicates(privateClaims, predicates, now = new Date()) {
  return predicates.map(p => {
    if (!p?.id || !p?.claim || !p?.op) throw new Error('predicate requires id, claim and op');
    return {
      id: p.id,
      claim: p.claim,
      op: p.op,
      passed: Boolean(evaluate(getPath(privateClaims, p.claim), p, now)),
    };
  });
}

function generateIssuerKeyPair() {
  const { publicKey, privateKey } = crypto.generateKeyPairSync('ed25519');
  return {
    publicKeyPem: publicKey.export({ type: 'spki', format: 'pem' }),
    privateKeyPem: privateKey.export({ type: 'pkcs8', format: 'pem' }),
  };
}

function issuerFingerprint(publicKeyPem) {
  return `sha256:${sha256(publicKeyPem)}`;
}

function issueAttestation({
  subject,
  purpose,
  issuer,
  privateClaims,
  predicates,
  disclose = [],
  privateKeyPem,
  publicKeyPem,
  nonce = crypto.randomBytes(24).toString('hex'),
  issuedAt = new Date().toISOString(),
  expiresAt = null,
}) {
  if (!subject || !purpose || !issuer || !privateClaims || !privateKeyPem || !publicKeyPem) {
    throw new Error('subject, purpose, issuer, privateClaims, privateKeyPem and publicKeyPem are required');
  }

  const now = new Date(issuedAt);
  if (Number.isNaN(now.getTime())) throw new Error('invalid issuedAt');

  const predicateResults = evaluatePredicates(privateClaims, predicates || [], now);
  const disclosures = {};
  for (const path of disclose) disclosures[path] = getPath(privateClaims, path);

  const publicPayload = {
    openproof: VERSION,
    backend: BACKEND,
    subject,
    purpose,
    issuer,
    issuer_key: issuerFingerprint(publicKeyPem),
    issued_at: issuedAt,
    ...(expiresAt ? { expires_at: expiresAt } : {}),
    claims_commitment: `sha256:${sha256(`${canonical(privateClaims)}:${nonce}`)}`,
    predicate_results: predicateResults,
    disclosures,
    disclosure_count: Object.keys(disclosures).length,
  };

  const signature = crypto.sign(null, Buffer.from(canonical(publicPayload)), privateKeyPem).toString('base64url');
  return { ...publicPayload, signature: { alg: 'Ed25519', value: signature } };
}

function verifyAttestation(proof, publicKeyPem, { requiredPredicates = [], purpose, now = new Date() } = {}) {
  const errors = [];
  if (proof?.openproof !== VERSION) errors.push(`openproof must be ${VERSION}`);
  if (proof?.backend !== BACKEND) errors.push(`backend must be ${BACKEND}`);
  if (!proof?.signature?.value) errors.push('signature required');
  if (purpose && proof?.purpose !== purpose) errors.push('purpose mismatch');
  if (proof?.issuer_key !== issuerFingerprint(publicKeyPem)) errors.push('issuer key mismatch');
  if (proof?.expires_at && Date.parse(proof.expires_at) < now.getTime()) errors.push('proof expired');

  const resultMap = new Map((proof?.predicate_results || []).map(x => [x.id, x]));
  for (const id of requiredPredicates) {
    if (!resultMap.has(id)) errors.push(`missing predicate: ${id}`);
    else if (resultMap.get(id).passed !== true) errors.push(`predicate failed: ${id}`);
  }

  if (!errors.length) {
    const { signature, ...payload } = proof;
    const ok = crypto.verify(
      null,
      Buffer.from(canonical(payload)),
      publicKeyPem,
      Buffer.from(signature.value, 'base64url'),
    );
    if (!ok) errors.push('invalid signature');
  }

  return { ok: errors.length === 0, errors };
}

module.exports = {
  VERSION,
  BACKEND,
  canonical,
  sha256,
  getPath,
  evaluatePredicates,
  generateIssuerKeyPair,
  issuerFingerprint,
  issueAttestation,
  verifyAttestation,
};
