# Dependencies - Sliick Charts

## Runtime Dependencies

None. The component has zero runtime dependencies. All chart rendering uses native LWC and SVG APIs provided by the Salesforce platform.

## Development Dependencies

These packages are used for local development and testing only. They are not included in the managed package.

| Package | Version | Purpose | Rationale |
| :--- | :--- | :--- | :--- |
| `@salesforce/sfdx-lwc-jest` | `^5.1.0` | LWC unit test runner | The official Salesforce Jest adapter for LWC. Required for testing LWC components in a Node environment. |
| `@sa11y/jest` | `^8.0.0` | Accessibility testing | Provides `toBeAccessible()` Jest matcher backed by axe-core. Ensures the component meets WCAG standards. |
| `baseline-browser-mapping` | `^2.9.11` | Browser compatibility baseline | Peer dependency required by `@salesforce/sfdx-lwc-jest` for module resolution. |

## Version Constraints

- Versions are pinned with caret ranges (`^`) to allow patch and minor updates within the major version. This balances receiving bug fixes with avoiding breaking changes.
- `@salesforce/sfdx-lwc-jest@5.x` supports Salesforce API version 65.0 (the project's `sourceApiVersion`). Do not upgrade to a major version without verifying API compatibility.

## Salesforce Platform Requirements

- **API Version**: 65.0 (Summer '25)
- **Package Type**: Second-generation managed package (2GP), namespace `sliick`

## Upgrade Considerations

- When upgrading `@salesforce/sfdx-lwc-jest`, check the release notes for changes to LWC mock behaviour, as test expectations may need updating.
- `@sa11y/jest` follows axe-core's rule updates. A major upgrade may cause previously passing accessibility tests to fail if new rules are introduced that the component does not satisfy.
