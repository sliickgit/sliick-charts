# Decision: Single Component Architecture

## Context

The six chart types (donut, pie, bar, column, line, area) could have been implemented as separate LWC components (e.g. `sliickDonutChart`, `sliickBarChart`) or as a single component with internal type routing.

## Options Considered

**Option 1: One component per chart type**
- Pro: Each component is smaller and simpler in isolation
- Pro: Easier to independently version chart types
- Con: Six separate components in the managed package
- Con: Users must learn different component names and properties
- Con: Shared rendering utilities (tooltips, legends, grid lines, color palette) would need to be duplicated or extracted into a separate utility component
- Con: App Builder would show six separate draggable components, increasing cognitive load for admins

**Option 2: Single component with type routing (chosen)**
- Pro: One component name and one API surface
- Pro: Shared properties (legend, colors, tooltips, grid lines) are naturally unified
- Pro: App Builder experience is simpler - one component, select chart type from a dropdown
- Pro: Callers only need to learn one API
- Con: The JS controller is larger and handles multiple rendering paths
- Con: The HTML template has conditional blocks for each chart type

## Decision

Use a single `sliickCharts` component that accepts a `chartType` property and internally routes to the appropriate rendering logic.

## Consequences

- The component's JavaScript file is larger than a single-type component would be.
- Internal routing relies on `isCircularChart`, `isBarChart`, and `isLineChart` boolean getters - these must be kept in sync with `VALID_CHART_TYPES`.
- Adding a new chart type requires changes to a single file rather than creating a new component bundle.
- The App Builder experience is clean - admins drag one component and change the type via a dropdown.
