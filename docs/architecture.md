# Architecture - Sliick Charts

## Component Structure

The package ships as a single Salesforce managed package (`sliick-charts`, namespace `sliick`) containing one LWC bundle and one static resource.

```
force-app/main/default/
  lwc/
    sliickCharts/
      sliickCharts.html        - Template: SVG structure, conditional rendering per chart type
      sliickCharts.js          - Controller: data processing, geometry calculation, event handling
      sliickCharts.css         - Styles: chart wrapper, tooltip, legend, hover states
      sliickCharts.js-meta.xml - Metadata: targets, @api property definitions for App Builder/Flow
  staticresources/
    SliickChartsLogo.resource          - Brand logo image
    SliickChartsLogo.resource-meta.xml

examples/main/default/
  lwc/
    sliickChartsExample/       - Reference implementation (not included in managed package)
```

## Rendering Pipeline

```
Caller (App Builder / Flow / Parent LWC)
         |
         | @api properties
         v
  sliickCharts.js (controller)
         |
         | effectiveChartData getter
         |   - chartDataJson (string) -> JSON.parse -> validated array
         |   - chartData (array) -> used directly
         |
         | normalizedChartType getter
         |   - lowercased, validated against VALID_CHART_TYPES
         |
         | Geometry getters (computed, reactive)
         |   - circularSegments  -> SVG arc path strings (donut/pie)
         |   - barSegments       -> SVG rect coordinates (bar/column)
         |   - lineChartData     -> SVG line/area path strings + point coords
         |   - gridLines         -> SVG line coordinates
         |
         v
  sliickCharts.html (template)
         |
         | LWC template binding ({segment.pathData}, {bar.x}, etc.)
         v
  Native SVG DOM elements
  (rendered by the browser inside the LWC shadow root)
```

## Coordinate System

All chart geometry is calculated in an SVG coordinate space defined by `viewBox="-100 -100 200 200"`. The origin (0,0) is at the center. Key constants:

| Constant | Value | Meaning |
| :--- | :--- | :--- |
| `OUTER_RADIUS` | 90 | Outer radius of donut/pie arcs |
| `CHART_BOUNDS` | 90 | Absolute boundary from center for bar/line charts |
| `MAX_CHART_HEIGHT` | 80 | Maximum bar or line height in SVG units |
| `GRID_SPACING` | 45 | Distance between grid lines |
| `HORIZONTAL_BAR_PADDING` | 20 | Right-side padding for horizontal bars to prevent clipping |

The `chartSize` `@api` property maps this fixed SVG coordinate space to actual pixel dimensions via CSS (`width` and `height` on the wrapper element).

## Chart Type Routing

The controller uses three boolean getters to route rendering:

- `isCircularChart` - true for `donut` and `pie`; uses `circularSegments`
- `isBarChart` - true for `bar` and `column`; uses `barSegments`
- `isLineChart` - true for `line` and `area`; uses `lineChartData`

The HTML template uses `lwc:if` directives tied to these getters to render the correct SVG markup.

## Data Flow Detail

### Input resolution (`effectiveChartData`)

`chartDataJson` takes priority over `chartData` when both are provided. This exists because App Builder and Flow can only pass string properties; programmatic parent components use the typed `chartData` array directly.

### Color resolution (`getColor`)

Per-item colors are read from `item.color` if present, falling back to a cyclic palette (`CHART_COLORS`). All colors pass through `validateColor` before being applied to any DOM attribute - see [Security](security.md).

### Responsive mode

When `responsive = true`, the wrapper width is set to `100%` of the container via inline style in `renderedCallback`. Height remains fixed at `chartSize` pixels to maintain consistent vertical space. The SVG `viewBox` is unchanged; the browser scales the SVG to fill the container width.

## External Dependencies

The component has no runtime dependencies. The dev toolchain dependencies are documented in [Dependencies](dependencies.md).

## Salesforce Platform Targets

The component is registered for the following targets in its metadata:

- `lightning__RecordPage` - Record detail pages
- `lightning__AppPage` - Custom app pages
- `lightning__HomePage` - Home pages
- `lightning__FlowScreen` - Flow screens (input-only properties)
- `analytics__Dashboard` - CRM Analytics dashboards
