# Solution Overview - Sliick Charts

## Problem Statement

Salesforce admins and developers frequently need to visualize data on record pages, app pages, and in flows. The standard platform options are limited in flexibility, while third-party charting libraries introduce external script dependencies that conflict with Salesforce's Lightning Web Security (LWS) and Locker Service restrictions. Sliick Charts solves this by providing a fully native, configurable charting component that runs entirely within Salesforce's security boundaries.

## Approach

The solution is a single Lightning Web Component (LWC) that renders all chart types using native SVG elements. No external JavaScript libraries are loaded. All geometry calculations are performed in the component's JavaScript controller, and the results are bound to SVG elements in the template using standard LWC data binding - which provides automatic HTML escaping and XSS prevention.

This approach was chosen over alternatives (e.g. wrapping D3.js, Chart.js, or using Canvas) because:
- Native SVG is fully supported within Salesforce's Lightning Web Security model
- Zero external dependencies means no supply chain risk and no CSP trusted-site configuration required
- LWC's reactive data binding handles re-rendering efficiently without manual DOM manipulation

## Key Components

| Component | Type | Purpose |
| :--- | :--- | :--- |
| `sliickCharts` | LWC (main package) | Core chart component. Accepts data and configuration, computes SVG geometry, renders all chart types. |
| `sliickChartsExample` | LWC (examples) | Reference implementation showing how to embed `sliickCharts` in a parent component with hard-coded sample data. |
| `SliickChartsLogo` | Static Resource | The Sliick brand logo image, loaded via `@salesforce/resourceUrl` and displayed in the component. |

## Key Flows

### 1. Lightning App Builder (declarative)

1. Admin drags the `Sliick Charts` component onto a page in Lightning App Builder.
2. Admin sets `Chart Type`, `Chart Data (JSON)`, and visual properties in the property panel.
3. On page load, the component receives `chartDataJson` as a string, parses it, validates the data, computes SVG geometry, and renders the chart.

### 2. Salesforce Flow (declarative)

1. A Screen Flow includes the `Sliick Charts` component on a screen step.
2. Flow variables are assigned to `chartDataJson` and configuration properties.
3. The component renders as part of the flow screen using the same rendering pipeline as above.

### 3. Developer / Parent LWC (programmatic)

1. A parent LWC passes a JavaScript array directly to the `chartData` property.
2. The component uses the array directly, skipping JSON parsing.
3. When the parent updates the array, LWC reactivity triggers a re-render automatically.

### 4. Tooltip interaction

1. User hovers over a chart segment, bar, or data point.
2. `handleMouseEnter` fires, looks up the element's data by index, computes position relative to the container, and sets `showTooltip = true`.
3. `renderedCallback` positions the tooltip element using inline styles.
4. On `handleMouseLeave`, the tooltip is hidden.

## What This Solution Does Not Do

- **No data persistence** - the component is a pure visualization layer; it does not create, read, update, or delete Salesforce records.
- **No Apex** - there is no server-side code. All processing is client-side.
- **No external calls** - no data is sent to any external server, and no Remote Site Settings or CSP Trusted Sites are required.
- **No authentication or authorization** - the component renders whatever data is passed to it; access control is the responsibility of the page or flow that embeds it.
- **No aggregation or querying** - the component does not query Salesforce data itself; the caller is responsible for fetching and formatting data.

## Related Documents

- [Architecture](architecture.md) - Component structure and data flow detail
- [API Reference](api-reference.md) - All `@api` properties and their types
- [User Guide](user-guide.md) - Step-by-step instructions for admins and developers
- [Security](security.md) - Security model and XSS prevention
- [Dependencies](dependencies.md) - Dev toolchain and rationale
- [Testing Strategy](testing-strategy.md) - Unit test approach
- [Changelog](changelog.md) - Version history
