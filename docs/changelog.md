# Changelog - Sliick Charts

## v1.2.0

- Updated project license to **Apache License 2.0**.
- Fixed casing mismatch in `chartType` default value ("donut" -> "Donut") to eliminate Lightning App Builder warnings.
- Updated documentation and installation links to the official AppExchange listing.
- Consolidated architectural and security documentation into the root `README.md`.

## v1.1.0

- Renamed static resource from `SliickLogo` to `SliickChartsLogo` for clarity and to align with the package name.
- Updated component to import the renamed resource.

## v1.0.0

- Initial public release.
- Passed security review (Code Analyzer: 0 violations).
- Supported chart types: Donut, Pie, Bar, Column, Line, Area.
- App Builder, Flow Screen, and programmatic LWC usage supported.
- Interactive tooltips on hover for all chart types.
- Color validation (`validateColor`) to prevent CSS injection.
- Removed `chartColorsJson` deprecated property.
- Added error handling and error toast for invalid JSON input.
- Added example LWC (`sliickChartsExample`).
- Added AppExchange documentation and Solution Architecture.

## v0.3.0

- Pre-release iteration (internal).

## v0.2.0

- Pre-release iteration (internal).

## v0.1.0

- Initial commit. Proof of concept for native SVG charting in LWC.
