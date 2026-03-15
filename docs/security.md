# Security - Sliick Charts

## Trust Model

Sliick Charts is a client-side visualization component with no server-side footprint. All rendering happens in the browser. The component trusts data passed to it by the caller (parent component, Flow, or App Builder), and takes responsibility for sanitizing that data before applying it to the DOM.

## External Calls

None. The component makes zero external API calls. There are no Remote Site Settings or CSP Trusted Sites required. No data leaves the Salesforce org.

## Data Storage

None. The component does not write to any Salesforce objects, custom settings, platform cache, `localStorage`, or `sessionStorage`. It is a pure rendering layer.

## No Apex

The package contains zero Apex classes. There is no server-side code path that could be exploited. The attack surface is limited entirely to the browser-side LWC.

## Lightning Web Security (LWS) Compliance

The component is fully compliant with Salesforce's Lightning Web Security and Locker Service:

- Uses only `lwc` standard modules.
- Does not access global `window`, `document`, or `eval` in unsafe ways.
- Respects Shadow DOM containment - all DOM access goes through `this.template.querySelector`.
- Does not load external scripts or use dynamic `import()`.

## Input Validation - Color Values (XSS Prevention)

The highest-risk input is the color field on data items, since color values are applied directly to SVG element attributes and inline CSS. An attacker who controls chart data could attempt to inject malicious CSS or break out of an attribute context.

All color values pass through `validateColor()` before use:

```javascript
const safeColorRegex = /^[a-zA-Z0-9#(),.%\-\s]+$/;
```

This allows hex colors, named colors, and CSS color functions (`rgb()`, `hsl()`, etc.) while blocking characters that could form CSS injection payloads (`; } { < > " ' \``). If a color fails validation, it is replaced with `#CCCCCC` and a warning is logged to the console.

**Disallowed characters include:**
- Semicolons (`;`) - would allow style property injection
- Curly braces (`{`, `}`) - would allow rule injection
- Angle brackets (`<`, `>`) - would allow tag injection
- Quotes (`"`, `'`, `` ` ``) - would allow attribute breakout

## Input Validation - Chart Data (JSON Parsing)

When `chartDataJson` is used, the string is parsed with `JSON.parse`. Invalid JSON is caught, an error toast is shown to the user, and no data is rendered. The parsed result is validated to be an array before use.

Numeric values from data items are coerced via `parseFloat`, which returns `NaN` for non-numeric inputs - these produce a zero-height bar or zero-angle segment rather than crashing.

## Text Rendering

All text displayed in the chart (labels, titles, center values, tooltip content) is rendered through LWC template binding (`{variable}`). LWC's templating engine automatically HTML-encodes these values, preventing XSS via label or title fields.

## Known Limitations

- Color validation is permissive enough to allow valid CSS color functions, which could theoretically contain Unicode or unusual characters. The regex catches the most dangerous ASCII injection vectors but is not a full CSS parser.
- The component does not validate that `value` fields are finite numbers. Callers should ensure data is well-formed. Passing `Infinity` or very large numbers will produce rendering artifacts but not a security issue.

## Security Review History

- v1.0.0: Passed internal security review. Code Analyzer report shows 0 violations. See `CodeAnalyzerReport.html` in the project root.
