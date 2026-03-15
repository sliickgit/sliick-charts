# Todo - Sliick Charts

Discovered work that is out of scope for the current task. Review and prioritise before starting each development cycle.

---

## Improvements

- **Animation** - Charts currently render without transition. A CSS transition or SVG animation on initial render would improve visual quality. Consider `stroke-dasharray`/`stroke-dashoffset` for circular charts, `scaleY` transitions for bars, and line draw-in effects for line/area charts.

## Documentation

- **AppExchange listing link** - Update README.md once the AppExchange listing is live.

## Resolved

Items below have been addressed and are kept for historical context.

- ~~**Dead reference: `effectiveChartColors` getter**~~ - Removed the three unused `const colors = this.effectiveChartColors` assignments from `circularSegments`, `barSegments`, and `lineChartData`.

- ~~**Tooltip in unit tests**~~ - Extracted tooltip position calculation into `calculateTooltipPosition()` pure method. Tooltip interaction covered by unit tests.

- ~~**Bar chart labels**~~ - Added CSS `max-width`, `overflow: hidden`, and `text-overflow: ellipsis` to `.legend-label` to prevent long labels from overflowing the chart container.

- ~~**Non-numeric value handling**~~ - Added `sanitiseChartData()` method that coerces string numbers via `parseFloat` and filters out `NaN` values with a console warning. Applied to both `chartDataJson` and `chartData` input paths.

- ~~**Single data point on line chart**~~ - Single data points are now centred at `x=0` instead of placed at the left edge.

- ~~**Manual test plan**~~ - Created `docs/manual-test-plan.md` covering all six chart types across App Builder, Flow, and programmatic usage.

