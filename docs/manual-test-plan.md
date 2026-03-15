# Manual Test Plan - Sliick Charts

This plan covers manual verification of all six chart types across the three supported surfaces: App Builder, Flow Screen, and programmatic (parent LWC). These tests require a Salesforce scratch org with the sliick-charts package deployed.

---

## Prerequisites

- Scratch org with `sliick-charts` deployed (`sf project deploy start`)
- At least one record page, app page, or home page available for App Builder testing
- At least one screen flow available for Flow testing
- The `sliickChartsExample` LWC deployed for programmatic testing (from `examples/`)

---

## Test Data

Use the following standard dataset across all tests unless stated otherwise:

```json
[
  {"label": "Sales", "value": 100, "color": "#5EB4FF"},
  {"label": "Marketing", "value": 75, "color": "#3AE867"},
  {"label": "Support", "value": 50, "color": "#FFC838"},
  {"label": "Engineering", "value": 120, "color": "#FF7346"},
  {"label": "HR", "value": 30, "color": "#E287F5"}
]
```

---

## 1. Donut Chart

### 1.1 App Builder

| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Drag Sliick Charts onto a page, set Chart Type to "Donut" | Component appears with placeholder |
| 2 | Paste test data JSON into Chart Data field | Donut chart renders with 5 coloured segments |
| 3 | Verify centre hole is visible | Inner radius creates a ring shape, not a filled circle |
| 4 | Set Donut Thickness to 30 | Ring becomes thinner |
| 5 | Set Donut Thickness to 80 | Ring becomes thicker (nearly fills the circle) |
| 6 | Set Center Label to "Total" and Center Value to "375" | Text appears in the donut centre |
| 7 | Hover over each segment | Tooltip shows label, value, and percentage |
| 8 | Verify legend shows all 5 items with colour swatches and percentages | Legend displays below the chart |
| 9 | Set Hide Legend to true | Legend disappears |
| 10 | Set Hide Percentages to true | Percentages removed from legend items |

### 1.2 Flow Screen

| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Add Sliick Charts to a screen flow, set Chart Type to "Donut" | Component appears in flow preview |
| 2 | Pass test data JSON via Chart Data input | Donut chart renders correctly |
| 3 | Verify tooltip interaction works in flow runtime | Hover tooltips function normally |

### 1.3 Programmatic

| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Pass `chartData` array to `c-sliick-charts` from parent LWC | Donut chart renders from array data |
| 2 | Dynamically update `chartData` | Chart re-renders with new data |

---

## 2. Pie Chart

### 2.1 App Builder

| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Set Chart Type to "Pie" with test data | Pie chart renders - no centre hole |
| 2 | Verify all segments meet at the centre point | Segments are triangular wedges from centre |
| 3 | Test with single data item `[{"label":"All","value":100}]` | Full circle renders |
| 4 | Hover each segment | Tooltips display correctly |
| 5 | Verify legend | Legend matches segment colours and labels |

### 2.2 Flow Screen

| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Set Chart Type to "Pie" in flow screen | Pie chart renders in flow runtime |

### 2.3 Programmatic

| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Set `chartType="pie"` and pass `chartData` array | Pie chart renders correctly |

---

## 3. Bar Chart (Horizontal)

### 3.1 App Builder

| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Set Chart Type to "Bar" with test data | Horizontal bars render left-to-right |
| 2 | Verify bar lengths are proportional to values | Engineering (120) has longest bar |
| 3 | Verify grid lines display (vertical lines) | Grid lines visible behind bars |
| 4 | Set Hide Grid Lines to true | Grid lines disappear |
| 5 | Hover each bar | Tooltip shows label and value |
| 6 | Verify legend | All items listed with colour swatches |

### 3.2 Flow Screen

| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Set Chart Type to "Bar" in flow | Horizontal bar chart renders |

### 3.3 Programmatic

| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Set `chartType="bar"` from parent | Bar chart renders from array data |

---

## 4. Column Chart (Vertical)

### 4.1 App Builder

| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Set Chart Type to "Column" with test data | Vertical bars render bottom-to-top |
| 2 | Verify bar heights are proportional to values | Engineering (120) has tallest bar |
| 3 | Verify grid lines display (horizontal lines) | Grid lines visible behind bars |
| 4 | Set Hide Grid Lines to true | Grid lines disappear |
| 5 | Hover each bar | Tooltip shows label and value |

### 4.2 Flow Screen

| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Set Chart Type to "Column" in flow | Column chart renders |

### 4.3 Programmatic

| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Set `chartType="column"` from parent | Column chart renders correctly |

---

## 5. Line Chart

### 5.1 App Builder

| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Set Chart Type to "Line" with test data | Line chart renders with connected points |
| 2 | Verify data points (circles) are visible at each value | 5 points connected by a line |
| 3 | Set Hide Data Points to true | Points disappear, line remains |
| 4 | Verify grid lines display | Horizontal grid lines visible |
| 5 | Hover each data point | Tooltip shows label and value |
| 6 | Test with single data point `[{"label":"Only","value":50}]` | Single point renders centred horizontally |

### 5.2 Flow Screen

| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Set Chart Type to "Line" in flow | Line chart renders |

### 5.3 Programmatic

| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Set `chartType="line"` from parent | Line chart renders correctly |

---

## 6. Area Chart

### 6.1 App Builder

| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Set Chart Type to "Area" with test data | Area chart renders with filled region below line |
| 2 | Verify semi-transparent fill below the line | Fill uses primary colour at 30% opacity |
| 3 | Verify data points visible | Points display on top of line |
| 4 | Set Hide Data Points to true | Points disappear, area fill and line remain |
| 5 | Hover data points | Tooltips function |

### 6.2 Flow Screen

| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Set Chart Type to "Area" in flow | Area chart renders |

### 6.3 Programmatic

| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Set `chartType="area"` from parent | Area chart renders correctly |

---

## 7. Cross-cutting Concerns

These tests apply to all chart types.

### 7.1 Sizing and Responsiveness

| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Set Chart Size to 200 | Chart renders smaller |
| 2 | Set Chart Size to 500 | Chart renders larger |
| 3 | Set Responsive to true | Chart width stretches to fill container |
| 4 | Resize browser window with Responsive on | Chart width adjusts, height stays fixed |

### 7.2 Title

| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Set Chart Title to "Revenue Breakdown" | Title appears above the chart |
| 2 | Clear Chart Title | Title area disappears |

### 7.3 Error Handling

| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Enter invalid JSON `{bad}` in Chart Data field | Error toast appears, chart renders empty |
| 2 | Enter data with non-numeric values `[{"label":"A","value":"abc"}]` | Invalid items excluded, warning logged to console |
| 3 | Enter empty array `[]` | Chart renders empty (no segments/bars/points) |
| 4 | Enter null/empty Chart Data | Chart renders empty gracefully |

### 7.4 Colour Validation

| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Use valid hex colours (`#FF0000`) | Colours applied correctly |
| 2 | Use valid named colours (`red`, `blue`) | Colours applied correctly |
| 3 | Use invalid colour with special characters | Falls back to #CCCCCC, warning logged |
| 4 | Omit colours from data items | Default palette colours used |

### 7.5 Legend Label Truncation

| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Use a very long label (50+ characters) | Label truncates with ellipsis in the legend |
| 2 | Hover truncated label | Full label visible via tooltip on the chart element |

### 7.6 Invalid Chart Type

| # | Step | Expected Result |
|---|------|-----------------|
| 1 | Set Chart Type to an invalid value (e.g. "scatter") | Defaults to donut chart |
