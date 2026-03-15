# Decision: Native SVG over Third-Party Charting Library

## Context

Sliick Charts needs to render interactive charts inside Salesforce Lightning pages and flows. Several well-established JavaScript charting libraries exist (D3.js, Chart.js, Highcharts, etc.) that could have been used as a foundation.

## Options Considered

**Option 1: Wrap a third-party library (e.g. Chart.js or D3.js)**
- Pro: Rich feature set, well-tested rendering, large community
- Con: External scripts are blocked by Salesforce Lightning Web Security (LWS) and Locker Service unless explicitly allowed via CSP Trusted Sites
- Con: Loading external scripts from a CDN introduces a network dependency and external call
- Con: Static resource bundling of a large library increases package size significantly
- Con: License considerations for AppExchange submission

**Option 2: Use Canvas API**
- Pro: Simpler API for some chart types
- Con: Canvas output is not accessible (not part of the accessibility tree)
- Con: Canvas does not scale cleanly with responsive containers in the same way SVG does

**Option 3: Native SVG (chosen)**
- Pro: SVG is natively supported within Salesforce's security model - no CSP exceptions required
- Pro: Zero external dependencies, no network calls
- Pro: SVG is part of the DOM - LWC's template binding works naturally, and axe-core accessibility checks work
- Pro: SVG scales with `viewBox` - chart rendering is resolution-independent
- Con: All geometry math must be implemented manually

## Decision

Implement all chart types using native SVG paths, rects, and circles calculated in JavaScript. No external charting library is used.

## Consequences

- The component has zero runtime dependencies, making it inherently secure and portable.
- Geometry calculations (arc math, coordinate transforms) are custom code that must be maintained.
- Some advanced chart features (animations, complex interaction models) require more effort to implement compared to wrapping a library.
- The package passes Salesforce's security review requirements without any CSP exceptions.
