# The Human Agency Loop

> **A world where intelligence is abundant, but agency remains human.**

OpenAction already describes bounded actions, approval paths, trust receipts and change impact. The **Human Agency Loop** is an additive portfolio profile for connecting those mechanics to a complete mission cycle:

```text
SENSE → UNDERSTAND → CHOOSE → ACT → PROVE → LEARN ↺
```

It is deliberately cross-domain.

- **OpsPilot** uses it to turn workflow evidence into bounded business action.
- **Council** can contribute competing interpretations before a choice.
- **Agent-Proof** can provide assurance evidence before authority widens.
- **Citizen Agents / civic tools** use it to turn public changes into inspectable next actions.
- **CareOS** can use it for clinician-reviewed workflow improvement.
- **Game Studio** uses simulation for mechanics and humans for fun/meaning.
- **HANA** uses it as a production loop: canon → creative choice → release → reader evidence → next episode.

## The common goal

The portfolio is not fundamentally about AI.

It is about **expanding human agency**:

1. make reality easier to see;
2. make complexity easier to understand;
3. make choices more explicit;
4. make useful action easier to take;
5. keep consequential authority visible;
6. measure what actually happened;
7. learn and improve without hiding uncertainty.

## Why now

Durable agent sessions, event-driven tool use, reusable plugins/MCP and cheaper long-horizon model work make it practical for a mission to persist across time instead of restarting from a blank prompt. The profile therefore treats the **mission state and evidence** as durable product state; an agent is one possible participant, not the system of record.

## What the loop refuses to do

- A simulation does not prove that humans will enjoy something.
- A model's confidence does not grant authority.
- A generated source is not ground truth.
- A completed tool call is not automatically a successful outcome.
- A beautiful creative variation does not become canon automatically.
- More automation is not progress if it removes useful human choice.

## Minimal contract

Every loop records:

- **Goal** — what human outcome matters.
- **State** — where reality is now and what evidence supports that.
- **Gap** — what blocks the next meaningful unlock.
- **Decision** — the selected path, rationale and decision owner.
- **Action** — the exact next move, executor and authority level.
- **Proof** — success metrics, evidence requirements and stop conditions.
- **Feedback** — observations and what triggers the next cycle.

Validate examples:

```bash
node tests/agency-loop.mjs
node scripts/validate-agency-loop.mjs \
  examples/agency-loop/opspilot.json \
  examples/agency-loop/hana-episode-1.json \
  examples/agency-loop/game-studio.json
```

This is an application profile, not an expansion of the OpenAction 1.0 Core. The Core stays small; the profile proves that one stable action/trust protocol can support very different human missions.
