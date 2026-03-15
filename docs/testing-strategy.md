# Testing Strategy - Sliick Charts

## Overview

Testing is done with Jest via `@salesforce/sfdx-lwc-jest`, which provides a Node-based LWC runtime. Tests run locally without a Salesforce org connection.

Accessibility is verified in the same test suite using `@sa11y/jest` (backed by axe-core).

## What Is Tested

### Unit Tests (`force-app/main/default/lwc/sliickCharts/__tests__/sliickCharts.test.js`)

Tests focus on observable behaviour from the outside, not internal implementation details:

- **Rendering** - does the component mount and produce the expected DOM structure?
- **Chart type switching** - does setting `chartType` produce the correct SVG element type?
- **Data binding** - do segments/bars/points appear when data is provided?
- **Empty state** - does the component render cleanly with no data?
- **JSON parsing** - does `chartDataJson` get parsed and rendered correctly? Does invalid JSON fire an error toast?
- **Color validation** - are invalid colors rejected and replaced with the fallback?
- **Accessibility** - does `toBeAccessible()` pass for a representative configuration?

## What Is Not (Currently) Tested

- The geometry math itself (arc path strings, coordinate calculations) - these are best verified visually.
- Tooltip positioning - depends on `getBoundingClientRect`, which returns zeros in Jest's JSDOM environment.
- `renderedCallback` inline style application - JSDOM does not execute `style.setProperty` reliably.
- The `sliickChartsExample` component - it is a reference implementation, not production code.

These gaps are tracked in [todo.md](todo.md).

## Running Tests

```bash
# Run all tests once
npm run test:unit

# Run with coverage report (output to coverage/)
npm run test:unit:coverage

# Watch mode
npm run test:unit:watch

# Debug mode (runs with Node inspector)
npm run test:unit:debug
```

## Mocking

`@salesforce/sfdx-lwc-jest` provides automatic mocks for Salesforce platform modules:
- `lightning/platformShowToastEvent` - mocked automatically; tests assert toast events via `addEventListener`.
- `@salesforce/resourceUrl/SliickChartsLogo` - resolved to an empty string by default in the test environment.

No custom mocks are currently needed.

## Coverage Expectations

The goal is meaningful coverage of the component's public API and error paths. 100% line coverage is not the target - coverage of the geometry calculation internals is low value given they require visual verification.

## Test File Location

```
force-app/main/default/lwc/sliickCharts/__tests__/sliickCharts.test.js
```
