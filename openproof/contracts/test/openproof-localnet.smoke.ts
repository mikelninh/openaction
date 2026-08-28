// @ts-nocheck
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import path from 'node:path';
import * as Rx from 'rxjs';
import * as ledgerRuntime from '@midnight-ntwrk/midnight-js-protocol/ledger';
import {
  CompactTypeBytes,
  transientHash,
} from '@midnight-ntwrk/midnight-js-protocol/compact-runtime';
import { CompiledContract } from '@midnight-ntwrk/midnight-js-protocol/compact-js';
import { deployContract } from '@midnight-ntwrk/midnight-js-contracts';
import { httpClientProofProvider } from '@midnight-ntwrk/midnight-js-http-client-proof-provider';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import { levelPrivateStateProvider } from '@midnight-ntwrk/midnight-js-level-private-state-provider';
import { setNetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import { NodeZkConfigProvider } from '@midnight-ntwrk/midnight-js-node-zk-config-provider';
import {
  DustWallet,
  HDWallet,
  InMemoryTransactionHistoryStorage,
  PublicKey as UnshieldedPublicKey,
  Roles,
  ShieldedWallet,
  UnshieldedWallet,
  WalletEntrySchema,
  WalletFacade,
  createKeystore,
} from '@midnight-ntwrk/wallet-sdk';
import { Contract, ledger, pureCircuits } from '../managed/openproof/contract/index.js';
import { witnesses } from '../witnesses.ts';
import { generateIssuerKeyPair, signFamilyAttestation } from '../issuer.ts';

const CONFIG = {
  networkId: 'undeployed',
  indexer: 'http://127.0.0.1:8088/api/v4/graphql',
  indexerWS: 'ws://127.0.0.1:8088/api/v4/graphql/ws',
  node: 'http://127.0.0.1:9944',
  proofServer: 'http://127.0.0.1:6300',
};
const PRIVATE_STATE_ID = 'openProofPrivateState';
const ZK_CONFIG_PATH = path.resolve('managed/openproof');
const bytes32Type = new CompactTypeBytes(32);

function localGenesisSeed(): Buffer {
  // Midnight local-dev genesis master seed: 0x00...001. LOCAL DEV ONLY.
  const seed = Buffer.alloc(32);
  seed[31] = 1;
  return seed;
}

async function waitForSync(wallet: WalletFacade) {
  return Rx.firstValueFrom(wallet.state().pipe(Rx.filter((state) => state.isSynced)));
}

async function waitForDust(wallet: WalletFacade) {
  return Rx.firstValueFrom(
    wallet.state().pipe(Rx.filter((state) => (state.dust?.balance(new Date()) ?? 0n) > 0n)),
  );
}

async function initGenesisWallet() {
  const hdWallet = HDWallet.fromSeed(localGenesisSeed());
  assert.equal(hdWallet.type, 'seedOk', 'genesis HD wallet must initialise');
  const derived = hdWallet.hdWallet
    .selectAccount(0)
    .selectRoles([Roles.Zswap, Roles.NightExternal, Roles.Dust])
    .deriveKeysAt(0);
  assert.equal(derived.type, 'keysDerived', 'genesis wallet roles must derive');
  hdWallet.hdWallet.clear();

  const shieldedSecretKeys = ledgerRuntime.ZswapSecretKeys.fromSeed(derived.keys[Roles.Zswap]);
  const dustSecretKey = ledgerRuntime.DustSecretKey.fromSeed(derived.keys[Roles.Dust]);
  const unshieldedKeystore = createKeystore(derived.keys[Roles.NightExternal], CONFIG.networkId);
  const relayURL = new URL(CONFIG.node.replace(/^http/, 'ws'));

  const shieldedConfig = {
    networkId: CONFIG.networkId,
    indexerClientConnection: { indexerHttpUrl: CONFIG.indexer, indexerWsUrl: CONFIG.indexerWS },
    provingServerUrl: new URL(CONFIG.proofServer),
    relayURL,
    txHistoryStorage: new InMemoryTransactionHistoryStorage(WalletEntrySchema),
  };
  const unshieldedConfig = {
    networkId: CONFIG.networkId,
    indexerClientConnection: { indexerHttpUrl: CONFIG.indexer, indexerWsUrl: CONFIG.indexerWS },
    txHistoryStorage: new InMemoryTransactionHistoryStorage(WalletEntrySchema),
  };
  const dustConfig = {
    networkId: CONFIG.networkId,
    costParameters: { additionalFeeOverhead: 300_000_000_000_000n, feeBlocksMargin: 5 },
    indexerClientConnection: { indexerHttpUrl: CONFIG.indexer, indexerWsUrl: CONFIG.indexerWS },
    provingServerUrl: new URL(CONFIG.proofServer),
    relayURL,
    txHistoryStorage: new InMemoryTransactionHistoryStorage(WalletEntrySchema),
  };

  const wallet = await WalletFacade.init({
    configuration: { ...shieldedConfig, ...unshieldedConfig, ...dustConfig },
    shielded: () => ShieldedWallet(shieldedConfig).startWithSecretKeys(shieldedSecretKeys),
    unshielded: () =>
      UnshieldedWallet(unshieldedConfig).startWithPublicKey(UnshieldedPublicKey.fromKeyStore(unshieldedKeystore)),
    dust: () =>
      DustWallet(dustConfig).startWithSecretKey(dustSecretKey, ledgerRuntime.LedgerParameters.initialParameters().dust),
  });
  await wallet.start(shieldedSecretKeys, dustSecretKey);
  await waitForSync(wallet);

  const synced = await Rx.firstValueFrom(wallet.state());
  const totalNight =
    (synced.unshielded?.balances[ledgerRuntime.nativeToken().raw] ?? 0n) +
    (synced.shielded?.balances[ledgerRuntime.nativeToken().raw] ?? 0n);
  assert(totalNight > 0n, 'local genesis wallet must contain NIGHT');

  const dustBefore = synced.dust?.balance(new Date()) ?? 0n;
  if (dustBefore === 0n) {
    const unregistered =
      synced.unshielded?.availableCoins.filter((coin) => coin.meta.registeredForDustGeneration === false) ?? [];
    assert(unregistered.length > 0, 'genesis wallet needs NIGHT UTXOs to register for DUST');
    const recipe = await wallet.registerNightUtxosForDustGeneration(
      unregistered,
      unshieldedKeystore.getPublicKey(),
      (payload) => unshieldedKeystore.signData(payload),
    );
    const finalized = await wallet.finalizeRecipe(recipe);
    await wallet.submitTransaction(finalized);
    await waitForDust(wallet);
  }

  return { wallet, shieldedSecretKeys, dustSecretKey, unshieldedKeystore };
}

async function createWalletProvider(walletContext) {
  await waitForSync(walletContext.wallet);
  return {
    getCoinPublicKey: () => walletContext.shieldedSecretKeys.coinPublicKey,
    getEncryptionPublicKey: () => walletContext.shieldedSecretKeys.encryptionPublicKey,
    async balanceTx(tx, ttl) {
      const recipe = await walletContext.wallet.balanceUnboundTransaction(
        tx,
        { shieldedSecretKeys: walletContext.shieldedSecretKeys, dustSecretKey: walletContext.dustSecretKey },
        { ttl: ttl ?? new Date(Date.now() + 30 * 60 * 1000) },
      );
      return walletContext.wallet.finalizeRecipe(recipe);
    },
    async submitTx(tx) {
      return walletContext.wallet.submitTransaction(tx);
    },
  };
}

async function main() {
  setNetworkId(CONFIG.networkId);
  process.env.MIDNIGHT_STORAGE_PASSWORD ??= 'openproof-local-ci-only';

  const walletContext = await initGenesisWallet();
  try {
    const walletProvider = await createWalletProvider(walletContext);
    const privateStateProvider = levelPrivateStateProvider({
      privateStateStoreName: 'openproof-localnet-private-state',
      privateStoragePasswordProvider: () => process.env.MIDNIGHT_STORAGE_PASSWORD,
      accountId: walletContext.unshieldedKeystore.getBech32Address().asString(),
    });
    const zkConfigProvider = new NodeZkConfigProvider(ZK_CONFIG_PATH);
    const providers = {
      privateStateProvider,
      publicDataProvider: indexerPublicDataProvider(CONFIG.indexer, CONFIG.indexerWS),
      zkConfigProvider,
      proofProvider: httpClientProofProvider(CONFIG.proofServer, zkConfigProvider),
      walletProvider,
      midnightProvider: walletProvider,
    };

    const compiledContract = CompiledContract.make('OpenProof', Contract).pipe(
      CompiledContract.withWitnesses(witnesses),
      CompiledContract.withCompiledFileAssets(ZK_CONFIG_PATH),
    );

    const userSecretKey = new Uint8Array(crypto.randomBytes(32));
    const deployed = await deployContract(providers, {
      compiledContract,
      privateStateId: PRIVATE_STATE_ID,
      initialPrivateState: { userSecretKey },
    });
    const contractAddress = deployed.deployTxData.public.contractAddress;
    console.log(`OpenProof deployed: ${contractAddress}`);
    console.log(`deploy tx: ${deployed.deployTxData.public.txId}`);

    const issuer = generateIssuerKeyPair();
    const providerTx = await deployed.callTx.registerProvider(1n, issuer.publicKey);
    console.log(`provider tx: ${providerTx.public.txId}`);

    const policyTx = await deployed.callTx.setFamilyPolicy(101n, {
      version: 1n,
      requiredProviderId: 1n,
      requiredCountryCode: 276n,
      minimumChildren: 1n,
      maximumMonthlyIncomeEur: 2_500n,
    });
    console.log(`policy tx: ${policyTx.public.txId}`);

    const subject = pureCircuits.deriveSubjectPublicKey(userSecretKey, 101n);
    const subjectHash = transientHash(bytes32Type, subject);
    const claim = {
      credentialId: 42_001n,
      revocationHandle: 88_001n,
      purposeCode: 101n,
      policyVersion: 1n,
      validUntil: BigInt(Math.floor(Date.now() / 1000) + 86_400),
      residentCountryCode: 276n,
      childCount: 2n,
      monthlyIncomeEur: 2_000n,
    };
    const family = {
      claim,
      signature: signFamilyAttestation(issuer.secretKey, claim, subjectHash),
      providerId: 1n,
    };
    await privateStateProvider.set(PRIVATE_STATE_ID, { userSecretKey, family });

    const requestBinding = 55_001n;
    const verifierNonce = 777_001n;
    const expectedNullifier = pureCircuits.deriveNullifier(userSecretKey, 101n, verifierNonce);
    const expectedChallengeHash = pureCircuits.verifierChallengeHash(verifierNonce);

    const proofTx = await deployed.callTx.proveFamilyEligibility(101n, requestBinding, verifierNonce);
    console.log(`family proof tx: ${proofTx.public.txId}`);
    console.log(`family proof block: ${proofTx.public.blockHeight}`);

    const chainState = await providers.publicDataProvider.queryContractState(contractAddress);
    assert(chainState != null, 'deployed OpenProof contract must be queryable through indexer');
    const state = ledger(chainState.data);
    assert.equal(state.providers.size(), 1n);
    assert.equal(state.familyPolicies.size(), 1n);
    assert.equal(state.usedNullifiers.size(), 1n);
    assert.equal(state.proofReceipts.size(), 1n);
    assert.equal(state.proofReceipts.member(expectedNullifier), true);

    const receipt = state.proofReceipts.lookup(expectedNullifier);
    assert.equal(receipt.proofType, 1n);
    assert.equal(receipt.purposeCode, 101n);
    assert.equal(receipt.policyVersion, 1n);
    assert.equal(receipt.providerId, 1n);
    assert.equal(receipt.bindingHash, requestBinding);
    assert.equal(receipt.auxiliaryBindingHash, 0n);
    assert.equal(receipt.verifierChallengeHash, expectedChallengeHash);

    // The exact same challenge must fail as a real second transaction attempt.
    await assert.rejects(
      () => deployed.callTx.proveFamilyEligibility(101n, requestBinding, verifierNonce),
      /already used/i,
    );

    console.log('OpenProof local Midnight E2E: PASS');
    console.log('✓ deployed contract');
    console.log('✓ registered policy-authorised issuer on ledger');
    console.log('✓ registered policy on ledger');
    console.log('✓ proof server produced + submitted family proof transaction');
    console.log('✓ indexer observed authoritative proof receipt');
    console.log('✓ receipt bound purpose + policy + issuer + request + verifier challenge');
    console.log('✓ real replay attempt rejected');
  } finally {
    await walletContext.wallet.stop();
  }
}

await main();
