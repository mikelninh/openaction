# HausPilot ZeroOps + ActionRail

A working **local pilot**, a publicly shareable **static interactive simulator**, and the beginnings of an **evidence-first, reusable action API**.

**Horizon 1 — HausPilot:** Berlin property-management message intake → deterministic classification → safe static response → customer-side approval for consequential actions → audit receipts → trial + Stripe Payment Link state hooks.

**Horizon 2 — ActionRail:** `api/actionrail.py` is domain-independent action policy, webhook verification and receipt-chain logic. It can become an API with explicit identities, scopes and third-party adapters after usage proves demand.

## Quick start

```bash
python -m venv .venv
source .venv/bin/activate    # Windows: .venv\\Scripts\\activate
pip install -r requirements.txt
DEMO_MODE=true uvicorn api.main:app --reload
# Visit http://localhost:8000, and /docs for API operations.
pytest -q
```

**Static demo:** open `web/index.html`, or host the folder on GitHub Pages. It clearly labels every simulation and stores synthetic case receipts in the visitor's local browser.

## Secure API sequence (local demo mode)

1. `POST /api/demo/register` with `{ "company": "Demo Hausverwaltung", "email": "demo@example.com" }` (works **only** when `DEMO_MODE=true`). Store returned `access_token` in a secure secrets manager.
2. `POST /api/cases`, `GET /api/cases`, `GET /api/receipts`, `GET /api/metrics` with `Authorization: Bearer <access_token>`.
3. `POST /api/cases/{case_id}/approve` sends an authorised tenant-owner draft only if a verified outbound email provider is configured.
4. Set `DEMO_MODE=false` for non-demo mode. Then `POST /api/signup/request` sends a 15-min email verification link; `GET /api/signup/verify` creates the account. No email provider = signup **fails closed**.
5. Connect a verified Stripe Payment Link and webhook to activate checkout sessions. No checkout configuration = billing returns 503.
6. Register a verified Resend `email.received` webhook. Signed events retrieve the original email via the API, map recipients to tenant inbox aliases and classify with idempotency. No verified inbound setup = no email intake.

## Zero founder operations by design

| Work | Actor | Authority |
|---|---|---|
| Online discovery and self-serve purchase | Customer + automations | customer consent and verified checkout |
| Account creation | Email verification | no unverified signup in production |
| Classification and approved fixed acknowledgements | Tenant agent | only safe categories, active subscriptions, verified email sender and provider |
| Contractor booking / financial instruction / legal and safety case | Customer's nominated manager | human approval and specialist follow-up |
| Receipts and metrics | ActionRail | local tamper-evident chain, not external proof or a trusted timestamp authority |
| Feedback | Customer dashboard | product iteration based on observations |
| Product incidents, chargebacks and contractual disputes | Business owner or hired qualified operator | cannot safely promise zero involvement |

**IMPORTANT** This is a prototype—not customer-ready or an unattended business. No production infrastructure is connected or claimed. It is deliberately honest about operations which remain unimplemented.

## Infrastructure gates before taking real users

- **Persistent managed Postgres + migrations**, DB-backed queues/locks, append-only remote audit, rate limiting, backup/restore and incident alerts. SQLite in the current pilot is not sufficient for production multi-instance deployment.
- **Identity/security:** OAuth/passkeys or secure HttpOnly sessions + MFA, per-tenant operators and RBAC (currently one bearer token per customer); explicit inbox/domain verification and recipient routing; signed webhooks are included.
- **Billing:** Subscriptions need verified customer/subscription-ID mapping, renewal/invoice payment, dunning, refunds/cancellation and payment failure logic. Current Stripe webhook handles verified `checkout.session.completed` for paid checkouts, not the full lifecycle. Stripe Payment Link must be configured for recurring charge via dashboard.
- **Email:** Configure `RESEND_API_KEY`, `RESEND_FROM`, `RESEND_WEBHOOK_SECRET`, `RESEND_INBOUND_DOMAIN` and verify provider domains. Put tenant inboxes under this domain. Outbound sends use preapproved static wording; unsafe category messages require tenant manager action.
- **Privacy/legal:** Art. 28 GDPR data-processing contract, lawful basis, privacy notice, data minimisation, retention and deletion workflow, appropriate EU hosting, security tests, German procurement/consumer communication review, crisis procedures. Do not ingest real tenant emails into a prototype before these are in place.
- **Market:** Interview real property managers, establish baseline handling times, track human corrections and incidents, and get a genuinely paid pilot. Revenue on this page is **zero** until verified.
- **Agency:** Never allow model outputs to authorize new actions. The `ActionRail` allowed actions and approval gates are deterministic and enforce minimum boundaries.

## API endpoints

`GET /api/health` · `POST /api/signup/request` · `GET /api/signup/verify` · `POST /api/demo/register` (local mode) · `GET /api/account` · `GET /api/billing/link` · `POST /api/webhooks/stripe` · `POST /api/webhooks/resend` · `GET/POST /api/cases` · `POST /api/cases/{case_id}/approve` · `GET /api/receipts` · `GET /api/metrics` · `POST /api/actions/evaluate`

## Architecture

```text
Customer ⇢ landing & checkout ⇢ verified onboarding ⇢ tenant account
                                           └⇢ Resend inbound ⇢ classification
                                                              └⇢ ActionRail policy
                                                                   ├⇢ preapproved static ack
                                                                   └⇢ manager review
                                                                   └⇢ evidence receipt
Operator: product health, no routine ticket management
```

The site is a test of product feel and workflows. Backend is an executable local pilot with integration seams. The commerce offer (€1,500 setup + €499/mo) is a proposed pricing experiment, not a live payment option or generated revenue.