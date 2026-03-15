# API Reference - Sliick Charts

## Component: `sliickCharts` (`c-sliick-charts`)

All public properties are decorated with `@api` and can be set from Lightning App Builder, Flow, or a parent LWC.

---

## Data Properties

### `chartData`
- **Type**: `Array<{ label: string, value: number, color?: string }>`
- **Default**: `[]`
- **Usage**: Programmatic (parent LWC). Pass a JavaScript array of data objects directly.
- **Notes**: Ignored if `chartDataJson` is also provided and valid.

```javascript
this.myData = [
    { label: 'Q1', value: 30, color: '#0070d2' },
    { label: 'Q2', value: 45 },
    { label: 'Q3', value: 20, color: '#4bca81' }
];
```

### `chartDataJson`
- **Type**: `string`
- **Default**: `''`
- **Usage**: App Builder, Flow. A JSON string representing the data array.
- **Notes**: Takes priority over `chartData` when both are present and valid. Fires an error toast if the string cannot be parsed as JSON.

```json
[{"label":"Sales","value":100,"color":"#0070d2"},{"label":"Marketing","value":50}]
```

---

## Chart Type

### `chartType`
- **Type**: `string`
- **Default**: `'donut'`
- **Valid values**: `'donut'`, `'pie'`, `'bar'`, `'column'`, `'line'`, `'area'`
- **Notes**: Case-insensitive. Falls back to `'donut'` if an invalid value is provided.

---

## Dimension Properties

### `chartSize`
- **Type**: `integer`
- **Default**: `300`
- **Unit**: Pixels
- **Notes**: Sets both width and height of the chart. When `responsive = true`, width is overridden to `100%` and only height is controlled by this value.

### `donutThickness`
- **Type**: `integer`
- **Default**: `50`
- **Unit**: SVG units (in a -100 to 100 coordinate space)
- **Notes**: Applies only to `donut` chart type. The inner radius is computed as `OUTER_RADIUS (90) - donutThickness`. Ignored for all other chart types.

---

## Text / Label Properties

### `chartTitle`
- **Type**: `string`
- **Default**: `''`
- **Notes**: Displayed above the chart. Hidden when empty.

### `centerLabel`
- **Type**: `string`
- **Default**: `''`
- **Notes**: Small text label in the center of donut/pie charts. Ignored for other chart types.

### `centerValue`
- **Type**: `string`
- **Default**: `''`
- **Notes**: Larger value text in the center of donut/pie charts. Often used to display a total or KPI. Ignored for other chart types.

---

## Display Toggle Properties

### `hideLegend`
- **Type**: `boolean`
- **Default**: `false`
- **Notes**: When `true`, the color-coded legend below the chart is hidden.

### `hidePercentages`
- **Type**: `boolean`
- **Default**: `false`
- **Notes**: When `true`, percentage values are hidden from the legend. Applies only to circular charts (donut/pie).

### `hideDataPoints`
- **Type**: `boolean`
- **Default**: `false`
- **Notes**: When `true`, the circle markers at each data point on line/area charts are hidden. Ignored for other chart types.

### `hideGridLines`
- **Type**: `boolean`
- **Default**: `false`
- **Notes**: When `true`, background grid lines are hidden. Applies to bar, column, line, and area charts. Ignored for circular charts.

### `responsive`
- **Type**: `boolean`
- **Default**: `false`
- **Notes**: When `true`, the chart width expands to fill its container. Height remains fixed at `chartSize` pixels.

---

## Data Object Shape

Each item in the data array must follow this shape:

| Field | Type | Required | Notes |
| :--- | :--- | :--- | :--- |
| `label` | `string` | Yes | Displayed in the legend and tooltip |
| `value` | `number` | Yes | The numeric value for sizing the segment/bar/point |
| `color` | `string` | No | Hex (`#FF0000`), named (`red`), or CSS color function (`rgb(255,0,0)`). Falls back to the built-in palette if omitted. Validated to prevent CSS injection. |

---

## Tooltip (Automatic)

The component renders an interactive tooltip on hover automatically. No configuration is required. The tooltip shows:
- Segment/bar/point label
- Raw value
- Percentage of total (calculated at render time)

---

## Example Usage (Parent LWC)

```html
<c-sliick-charts
    chart-type="donut"
    chart-data={salesData}
    chart-size="300"
    donut-thickness="50"
    chart-title="Revenue by Region"
    center-label="Total"
    center-value="$245K"
    hide-legend="false"
    hide-percentages="false"
>
</c-sliick-charts>
```

```javascript
import { LightningElement } from 'lwc';

export default class MyComponent extends LightningElement {
    salesData = [
        { label: 'North', value: 120000, color: '#0070d2' },
        { label: 'South', value: 85000,  color: '#4bca81' },
        { label: 'East',  value: 40000,  color: '#ffb75d' }
    ];
}
```
