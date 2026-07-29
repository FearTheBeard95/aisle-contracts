# @aisle/contracts

Shared contracts for the AISLE platform: agent tool schemas (PRD §7), API DTOs,
error envelope, the subscription plan matrix, Modernist design tokens, and the
intent/price parsing helpers.

Consumed by `aisle-api`, `aisle-console`, `aisle-mobile` and `aisle-landing` as a
git dependency pinned to a tag. Bump by tagging a new version — never edit a
consumer's `node_modules`.

    pnpm add "@aisle/contracts@git+https://github.com/<org>/aisle-contracts#v0.1.0"

Money is integer cents throughout. Timestamps are ISO-8601 UTC strings.
