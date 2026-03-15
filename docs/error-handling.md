# Error Handling - Sliick Charts

## Principles

- Errors visible to the user should be actionable, not technical.
- Internal/debug information is logged to the browser console only, never displayed in the UI.
- The component should degrade gracefully on bad data rather than crashing.

## Error Scenarios

### Invalid JSON in `chartDataJson`

**What happens**: `JSON.parse` throws an exception.

**Handling**: The exception is caught. A user-facing toast notification is fired:
```
Title: "Error Parsing Chart Data"
Message: "Invalid JSON provided in Chart Data. Please check the format."
Variant: error
```
The raw error object is logged to the console via `console.error` for debugging. The chart renders nothing (empty data fallback).

### Invalid color value

**What happens**: A data item's `color` field contains characters outside the safe regex.

**Handling**: The color is silently replaced with `#CCCCCC` (grey). A warning is logged via `console.warn` with the rejected value. No user-facing error is shown, because invalid colors are not a critical failure - the chart still renders.

### Empty or missing data

**What happens**: `effectiveChartData` resolves to an empty array.

**Handling**: Geometry getters (`circularSegments`, `barSegments`, `lineChartData`) return empty arrays. The template renders the chart frame with no segments. No error is thrown or displayed. This is a valid state (e.g. a chart waiting for data to load).

### Invalid chart type

**What happens**: `chartType` is set to an unrecognised string.

**Handling**: `normalizedChartType` falls back to `'donut'` silently. No user-facing error. The rationale is that a fallback render is better than a broken page, particularly in App Builder where the admin may be mid-configuration.

### Non-numeric values

**What happens**: A data item's `value` field is not a number (e.g. a string or `null`).

**Handling**: `parseFloat` coerces the value. Non-parseable values become `NaN`, which propagates as `0` in most arithmetic (e.g. `sum + NaN = NaN`, but the division still produces `NaN`). This can cause rendering artifacts (missing segments). Callers are responsible for ensuring data is well-formed. No defensive error is thrown, as this would add complexity for edge cases that should not occur with well-formed data.

## Console Logging

| Level | Trigger |
| :--- | :--- |
| `console.error` | JSON parse failure in `effectiveChartData` |
| `console.warn` | Color validation failure in `validateColor` |

No `console.log` calls are left in production code (they were removed during the v1 security review).

## What Is Not Logged

- Data values (never log PII or business data to the console)
- User identifiers or session information (the component has no access to these)
- Stack traces beyond what the browser attaches automatically to `console.error`
