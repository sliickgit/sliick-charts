# User Guide - Sliick Charts

## Overview

Sliick Charts lets you display beautiful, interactive charts directly on Salesforce pages and in flows - without any external tools or setup. It supports six chart types: Donut, Pie, Bar, Column, Line, and Area.

This guide is for Salesforce admins configuring charts in Lightning App Builder or Flow, and for developers embedding the component in their own LWCs.

---

## Getting Started

### Prerequisites

- Sliick Charts must be installed in your Salesforce org. See the [README](../README.md) for installation instructions.
- You need appropriate permissions to edit Lightning pages or flows.

### Verifying the installation

After installation, navigate to **Setup > Installed Packages** and confirm `sliick-charts` appears in the list.

---

## Using in Lightning App Builder

1. Open the page you want to edit in **Lightning App Builder** (Setup > Lightning App Builder, or click the gear icon on any page and choose "Edit Page").
2. In the component panel on the left, search for **"Sliick Charts"**.
3. Drag the component onto the canvas and drop it in your preferred position.
4. Click the component to open the **property panel** on the right.

### Configuration Options

| Property | What it does |
| :--- | :--- |
| **Chart Type** | Choose from Donut, Pie, Bar, Column, Line, or Area. |
| **Chart Data (JSON)** | Paste your data as a JSON array (see format below). |
| **Chart Size (px)** | Sets the width and height of the chart in pixels. Default is 300. |
| **Donut Thickness** | Controls the ring width on donut charts. Higher values = thicker ring. |
| **Chart Title** | Optional heading displayed above the chart. |
| **Hide Legend** | Check to remove the colour-coded legend below the chart. |
| **Hide Percentages in Legend** | Check to hide percentage values from the legend (donut/pie only). |
| **Center Label** | Small text in the center of the chart (donut/pie only). |
| **Center Value** | Larger value in the center of the chart (donut/pie only). |
| **Hide Data Points** | Check to remove circle markers on line/area charts. |
| **Hide Grid Lines** | Check to remove background grid lines. |

### Chart Data JSON Format

Paste a JSON array into the **Chart Data (JSON)** field. Each item needs a `label` and a `value`. The `color` field is optional - if omitted, the component uses its built-in colour palette.

```json
[
  {"label": "Q1", "value": 42000, "color": "#0070d2"},
  {"label": "Q2", "value": 58000, "color": "#4bca81"},
  {"label": "Q3", "value": 35000, "color": "#ffb75d"},
  {"label": "Q4", "value": 71000, "color": "#ff7346"}
]
```

5. Click **Save** and then **Activate** to publish your changes.

---

## Using in Salesforce Flow

1. Open your flow in **Flow Builder**.
2. Add a **Screen** element (or edit an existing one).
3. In the components panel, find **"Sliick Charts"** and drag it onto the screen.
4. Use Flow variables or formulas to populate the **Chart Data (JSON)** and other input properties.
5. Save and activate your flow.

**Tip**: Use a Formula resource to build the JSON string dynamically from flow variables if your data changes at runtime.

---

## Using in a Custom LWC (Developers)

Add the component to your template:

```html
<c-sliick-charts
    chart-type="column"
    chart-data={revenueData}
    chart-size="400"
    chart-title="Monthly Revenue"
    hide-legend="false"
>
</c-sliick-charts>
```

Define your data in the JavaScript controller:

```javascript
import { LightningElement } from 'lwc';

export default class MyDashboard extends LightningElement {
    revenueData = [
        { label: 'Jan', value: 32000 },
        { label: 'Feb', value: 41000 },
        { label: 'Mar', value: 38000 },
        { label: 'Apr', value: 52000 }
    ];
}
```

See the [API Reference](api-reference.md) for all available properties.

---

## Interacting with Charts

- **Hover** over any segment, bar, or data point to see a tooltip with the label, value, and percentage.
- The tooltip disappears when you move the cursor away.

---

## Common Issues and FAQs

**Q: The chart is not showing any data.**
- Check that your JSON is valid. Use a tool like [jsonlint.com](https://jsonlint.com) to verify.
- Make sure each item has both a `label` and a `value` field.
- If using the programmatic `chartData` property, ensure the array is not empty.

**Q: I see an error toast saying "Invalid JSON provided in Chart Data".**
- The JSON string in the **Chart Data (JSON)** field could not be parsed. Check for missing quotes, trailing commas, or other syntax errors.

**Q: My custom colors are being ignored.**
- Colors must use safe characters only: letters, numbers, `#`, `(`, `)`, `.`, `,`, `%`, spaces, and hyphens. If a color fails validation, the component falls back to its default palette.
- Make sure your hex codes start with `#` (e.g. `#FF0000`, not `FF0000`).

**Q: The chart looks squashed or too small.**
- Increase the **Chart Size (px)** property. The component renders at a fixed size by default.
- If the component is inside a narrow column, consider enabling **Responsive** mode (programmatic only) or reducing the chart size to fit.

**Q: The donut thickness setting doesn't seem to work.**
- Donut thickness only applies to the **Donut** chart type. Switch the chart type to Donut first.

**Q: Center label/value is not showing.**
- Center content is only displayed on **Donut** and **Pie** chart types.

---

## Who to Contact

For bugs or feature requests, open an issue in the project repository. For Salesforce org-specific questions (permissions, deployment), contact your Salesforce administrator.
