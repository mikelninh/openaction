# Versioning and compatibility

OpenAction uses semantic versioning for stable releases and SemVer prerelease tags for candidates.

- `1.0-rc1` may still change before `1.0.0` if external testing reveals a Core flaw.
- `1.x` MUST remain backwards compatible at the Core contract level; additive optional fields belong in minors.
- breaking schema or lifecycle changes require a new major version.
- deprecated fields receive at least one minor-version migration window after 1.0 unless a security issue requires faster removal.
- extensions MUST live under the explicit `extensions` object or a published domain profile.

The normative specification is versioned content under `spec/`. The reference SDK and website are implementations, not the protocol itself.