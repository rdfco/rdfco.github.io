# ADR-001: Preserve Legacy production until Native parity

- Status: Accepted
- Date: 2026-07-19
- Decision owner: FARA refactoring roadmap

## Context

The current legacy Astro/WebGL page has an approved visual and interaction result. Native React/R3F code improves ownership and maintainability but has not passed complete parity. Replacing production during structural refactoring would combine architecture risk with visual and operational risk.

## Decision

Public routes continue to render `LegacySite` through M15. Native development remains behind `/native-preview`. M16 performs a reversible production cutover with Legacy intact as failback. M17 removes Legacy only after a stable production period and explicit removal approval.

## Alternatives considered

### Immediate native replacement

Rejected because it removes the visual oracle before equivalence is proven.

### Refactor the generated legacy bundles

Rejected because hashed Astro output is generated, selector-sensitive, difficult to maintain, and unsuitable as a long-term source architecture.

### Keep the iframe permanently

Rejected as the target because it preserves duplicated ownership, DOM mutation, route bridging, and poor discoverability.

## Consequences

### Positive

- Production remains stable during refactoring.
- Each native milestone has a real before/after oracle.
- Cutover and cleanup are independently reversible decisions.
- Raw legacy branding can remain fail-closed behind the existing readiness gate.

### Negative

- Two renderer paths coexist temporarily.
- Assets, content adapters, tests, and documentation require explicit mode labels.
- Legacy maintenance continues until M17.

## Compliance

- Native code must not import legacy adapters or generated files.
- M0 baselines cannot be replaced silently.
- A milestone cannot switch public route ownership.
- Production cutover requires Gate E approval.
- Legacy deletion requires a separate explicit approval after cutover stability.
