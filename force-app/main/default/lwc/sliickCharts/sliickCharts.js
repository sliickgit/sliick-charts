import { LightningElement, api, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import SLIICK_LOGO from '@salesforce/resourceUrl/SliickChartsLogo';

/**
 * A reusable multi-chart component built with native SVG.
 *
 * 1.3.0 adds: separate chartWidth + chartHeight, named color palettes,
 * built-in empty state (noDataLabel), chartclick events for drill-down,
 * yAxisFormat (number/currency/percent), automatic x-axis label rotation
 * when labels would collide, sparkline / stacked / heatmap chart types,
 * and exposes the existing `responsive` flag in App Builder.
 *
 * Backward-compatible: charts authored against 1.2.x with only `chartSize`
 * continue to render unchanged. The new props add capability, they don't
 * remove any.
 *
 * @author Jerry Huang
 */
export default class sliickCharts extends LightningElement {
    // ========================================
    // PUBLIC API — CHART TYPE & DATA
    // ========================================

    /**
     * Chart type. Donut | Pie | Bar | Column | Line | Area
     * | Sparkline (1.3.0) | StackedColumn (1.3.0) | StackedBar (1.3.0) | Heatmap (1.3.0)
     */
    @api chartType = 'Donut';

    /**
     * Chart data array.
     * Standard charts:    [{ label, value, color? }]
     * Stacked charts:     [{ label, segments: [{name, value, color?}] }]
     * Heatmap:            [{ row, col, value, label? }]
     */
    @api chartData = [];

    /** JSON string variant for App Builder (parsed to chartData). */
    @api chartDataJson = '';

    // ========================================
    // PUBLIC API — DIMENSIONS
    // ========================================

    /** Width + height in pixels (1.2.x compat — used when chartWidth/chartHeight are unset). */
    @api chartSize = 300;

    /**
     * Width in pixels. Falls back to chartSize when unset. Use this for
     * rectangular charts (column/bar timelines, sparklines) where width
     * and height should differ.
     */
    @api chartWidth;

    /** Height in pixels. Falls back to chartSize when unset. */
    @api chartHeight;

    /** Donut ring thickness in SVG units (donut charts only). */
    @api donutThickness = 50;

    /**
     * Whether the chart should fill 100% of its container's width. 1.3.0 exposes
     * this to App Builder.
     */
    @api responsive = false;

    // ========================================
    // PUBLIC API — STYLING
    // ========================================

    /** Optional title displayed above the chart. */
    @api chartTitle = '';

    /**
     * Named color palette. 1.3.0. When set, fills `color` for every data
     * item that doesn't already have one. Per-point `color` always wins.
     * Options: default | categorical | sequential | warm | cool | greyscale
     */
    @api palette = 'default';

    // ========================================
    // PUBLIC API — TOGGLES
    // ========================================

    @api hideLegend = false;
    @api hidePercentages = false;
    @api centerLabel = '';
    @api centerValue = '';
    @api hideDataPoints = false;
    @api hideGridLines = false;
    @api hideLogo = false;

    /**
     * Message shown when chartData resolves to an empty array. 1.3.0.
     * Set to empty string to suppress.
     */
    @api noDataLabel = 'No data to display';

    /**
     * Y-axis value formatter. 1.3.0.
     * Options: number | currency | percent | compact (1.2K / 1.2M / 1.2B)
     */
    @api yAxisFormat = 'number';

    /** Currency code for `yAxisFormat="currency"`. Defaults to USD. */
    @api currencyCode = 'USD';

    // ========================================
    // PRIVATE STATE
    // ========================================

    @track showTooltip = false;
    @track tooltipData = { label: '', value: 0, percentage: '0' };
    @track tooltipPosition = { x: 0, y: 0 };

    // ========================================
    // CONSTANTS
    // ========================================

    /** Default categorical palette (1.2.x compatible — kept as `default`). */
    DEFAULT_PALETTE = [
        '#5EB4FF', '#3AE867', '#FFC838', '#FF7346',
        '#E287F5', '#47C9F2', '#FF5D5D', '#7DD387'
    ];

    /** Named palettes (1.3.0). Each is a different design hand. */
    PALETTES = {
        default: this.DEFAULT_PALETTE,
        categorical: [
            '#2563eb', '#dc2626', '#16a34a', '#ca8a04',
            '#9333ea', '#0891b2', '#db2777', '#65a30d'
        ],
        sequential: [
            '#dbeafe', '#bfdbfe', '#93c5fd', '#60a5fa',
            '#3b82f6', '#2563eb', '#1d4ed8', '#1e40af'
        ],
        warm: [
            '#fef3c7', '#fde68a', '#fcd34d', '#fbbf24',
            '#f59e0b', '#d97706', '#b45309', '#92400e'
        ],
        cool: [
            '#cffafe', '#a5f3fc', '#67e8f9', '#22d3ee',
            '#06b6d4', '#0891b2', '#0e7490', '#155e75'
        ],
        greyscale: [
            '#f4f4f5', '#e4e4e7', '#d4d4d8', '#a1a1aa',
            '#71717a', '#52525b', '#3f3f46', '#27272a'
        ]
    };

    /** Heatmap intensity palette (light to dark — sequential). */
    HEATMAP_PALETTE = ['#ebedf0', '#c6e48b', '#7bc96f', '#239a3b', '#196127'];

    OUTER_RADIUS = 90;
    CHART_BOUNDS = 90;
    MAX_CHART_HEIGHT = 80;
    GRID_SPACING = 45;
    HORIZONTAL_BAR_PADDING = 20;
    SLIICK_URL = 'https://sliick.com';

    VALID_CHART_TYPES = [
        'donut', 'pie', 'bar', 'column', 'line', 'area',
        'sparkline', 'stackedcolumn', 'stackedbar', 'heatmap'
    ];

    // ========================================
    // GETTERS — IDENTITY
    // ========================================

    get showLegend() { return !this.hideLegend; }
    get showPercentages() { return !this.hidePercentages; }
    get showLogo() { return !this.hideLogo; }
    get hasTitle() { return !!this.chartTitle; }
    get hasCenterContent() { return !!this.centerLabel || !!this.centerValue; }
    get logoUrl() { return SLIICK_LOGO; }

    get normalizedChartType() {
        const type = (this.chartType || 'donut').toLowerCase().replace(/[\s_-]/g, '');
        return this.VALID_CHART_TYPES.includes(type) ? type : 'donut';
    }

    get isCircularChart() {
        const t = this.normalizedChartType;
        return t === 'donut' || t === 'pie';
    }
    get isBarChart() {
        const t = this.normalizedChartType;
        return t === 'bar' || t === 'column';
    }
    get isLineChart() {
        const t = this.normalizedChartType;
        return t === 'line' || t === 'area';
    }
    get isSparkline() {
        return this.normalizedChartType === 'sparkline';
    }
    get isStackedChart() {
        const t = this.normalizedChartType;
        return t === 'stackedcolumn' || t === 'stackedbar';
    }
    get isHeatmap() {
        return this.normalizedChartType === 'heatmap';
    }
    get isAxisChart() {
        // Anything that uses a y-axis label column.
        return this.isBarChart || this.isLineChart || this.isStackedChart;
    }

    get innerRadius() {
        if (this.normalizedChartType === 'pie') return 0;
        return Math.max(0, this.OUTER_RADIUS - this.donutThickness);
    }

    // ========================================
    // GETTERS — DATA
    // ========================================

    /**
     * Effective chart data. Parses chartDataJson when provided; otherwise
     * uses chartData. Applies the named palette to fill in missing colors.
     * Sanitises numeric values + skips non-numeric entries.
     */
    get effectiveChartData() {
        let raw = this.chartData || [];
        if (this.chartDataJson && typeof this.chartDataJson === 'string' && this.chartDataJson.trim()) {
            try {
                const parsed = JSON.parse(this.chartDataJson);
                if (Array.isArray(parsed)) raw = parsed;
            } catch (e) {
                // eslint-disable-next-line no-console
                console.error('sliickCharts: invalid chartDataJson', e);
                this.dispatchEvent(new ShowToastEvent({
                    title: 'Error Parsing Chart Data',
                    message: 'Invalid JSON in chartDataJson.',
                    variant: 'error'
                }));
            }
        }
        if (this.isStackedChart) {
            return this.sanitiseStackedData(raw);
        }
        if (this.isHeatmap) {
            return this.sanitiseHeatmapData(raw);
        }
        return this.sanitiseFlatData(raw);
    }

    sanitiseFlatData(data) {
        if (!Array.isArray(data)) return [];
        const palette = this.activePalette;
        return data.reduce((out, item, idx) => {
            const numericValue = parseFloat(item.value);
            if (Number.isNaN(numericValue)) {
                // eslint-disable-next-line no-console
                console.warn(
                    `sliickCharts: Non-numeric value "${item.value}" at index ${idx} (label: "${item.label}") - item excluded`
                );
                return out;
            }
            const color = item.color || palette[idx % palette.length];
            out.push({ ...item, value: numericValue, color });
            return out;
        }, []);
    }

    sanitiseStackedData(data) {
        if (!Array.isArray(data)) return [];
        const palette = this.activePalette;
        return data.reduce((out, item) => {
            if (!item || !Array.isArray(item.segments)) return out;
            const segs = item.segments.map((s, sidx) => {
                const v = parseFloat(s.value);
                if (Number.isNaN(v)) return null;
                return {
                    name: s.name || `Series ${sidx + 1}`,
                    value: v,
                    color: s.color || palette[sidx % palette.length]
                };
            }).filter(Boolean);
            if (segs.length === 0) return out;
            out.push({ label: item.label || '', segments: segs });
            return out;
        }, []);
    }

    sanitiseHeatmapData(data) {
        if (!Array.isArray(data)) return [];
        return data.reduce((out, item) => {
            const r = parseInt(item.row, 10);
            const c = parseInt(item.col, 10);
            const v = parseFloat(item.value);
            if (Number.isNaN(r) || Number.isNaN(c) || Number.isNaN(v)) return out;
            out.push({ row: r, col: c, value: v, label: item.label });
            return out;
        }, []);
    }

    get activePalette() {
        return this.PALETTES[this.palette] || this.DEFAULT_PALETTE;
    }

    get hasData() {
        const d = this.effectiveChartData;
        if (!Array.isArray(d) || d.length === 0) return false;
        if (this.isStackedChart) {
            return d.some(item => item.segments && item.segments.some(s => s.value > 0));
        }
        if (this.isHeatmap) return d.length > 0;
        return d.some(item => Number(item.value) > 0);
    }

    get isEmpty() {
        return !this.hasData;
    }

    get showNoDataMessage() {
        return this.isEmpty && !!this.noDataLabel;
    }

    get totalValue() {
        const d = this.effectiveChartData;
        if (!Array.isArray(d)) return 0;
        if (this.isStackedChart) {
            return d.reduce((s, i) => s + i.segments.reduce((t, x) => t + x.value, 0), 0);
        }
        return d.reduce((s, i) => s + parseFloat(i.value || 0), 0);
    }

    get maxValue() {
        const d = this.effectiveChartData;
        if (!Array.isArray(d) || d.length === 0) return 0;
        if (this.isStackedChart) {
            return Math.max(...d.map(i => i.segments.reduce((t, x) => t + x.value, 0)));
        }
        if (this.isHeatmap) {
            return Math.max(...d.map(i => i.value));
        }
        return Math.max(...d.map(i => parseFloat(i.value || 0)));
    }

    get primaryColor() {
        const d = this.effectiveChartData;
        if (d && d.length > 0 && d[0].color) return this.validateColor(d[0].color);
        return this.activePalette[0];
    }

    // ========================================
    // RENDER LIFECYCLE
    // ========================================

    renderedCallback() {
        const wrapper = this.template.querySelector('.chart-wrapper');
        if (wrapper) {
            const w = this.chartWidth || this.chartSize;
            const h = this.chartHeight || this.chartSize;
            if (this.responsive) {
                wrapper.style.setProperty('--chart-size', '100%');
                wrapper.style.width = '100%';
                wrapper.style.height = `${h}px`;
            } else {
                wrapper.style.setProperty('--chart-size', `${w}px`);
                wrapper.style.width = `${w}px`;
                wrapper.style.height = `${h}px`;
            }
        }
        const tooltip = this.template.querySelector('.tooltip');
        if (tooltip) {
            tooltip.style.left = `${this.tooltipPosition.x}px`;
            tooltip.style.top = `${this.tooltipPosition.y}px`;
        }
    }

    /**
     * Whether the chart needs an SVG preserveAspectRatio of "none". Circular
     * charts must preserve aspect to stay round; rectangular charts can
     * stretch when width != height. Axis labels are HTML overlays (see
     * htmlYAxisTicks / htmlXAxisLabels), so SVG text stretching is no longer
     * a concern for rectangular charts.
     */
    get svgPreserveAspectRatio() {
        if (this.isCircularChart) return 'xMidYMid meet';
        return 'none';
    }

    /**
     * True when this chart renders HTML-overlay axis labels in the wrapper
     * padding area. Vertical axis chart types (column / line / area /
     * stackedcolumn) get both Y-tick + X-label overlays; horizontal bars,
     * sparkline, heatmap, donut, pie do not.
     */
    get hasHtmlAxisLabels() {
        if (!this.isAxisChart || this.hideGridLines) return false;
        const t = this.normalizedChartType;
        return t === 'column' || this.isLineChart || t === 'stackedcolumn';
    }

    /**
     * Wrapper class — adds a hook for the CSS padding that makes room for
     * the HTML axis labels (left gutter for Y-ticks, bottom gutter for
     * X-labels). Non-axis charts get no padding.
     */
    get wrapperClass() {
        return this.hasHtmlAxisLabels
            ? 'chart-wrapper chart-wrapper--has-axis-labels'
            : 'chart-wrapper';
    }

    /**
     * Y-axis tick labels as HTML overlays — 5 ticks at max / 0.75max /
     * 0.5max / 0.25max / 0, positioned with topPercent inside the left
     * gutter. CSS `transform: translateY(-50%)` centers each label on its
     * tick line.
     */
    get htmlYAxisTicks() {
        if (!this.hasHtmlAxisLabels) return [];
        const max = this.maxValue || 0;
        const ticks = [];
        for (let i = 0; i <= 4; i++) {
            const value = max * ((4 - i) / 4);
            const topPct = (i / 4) * 100;
            ticks.push({
                id: `ytick-${i}`,
                label: this.formatValue(value),
                style: `top: ${topPct}%;`
            });
        }
        return ticks;
    }

    /**
     * X-axis labels as HTML overlays — one per data point, positioned at
     * leftPercent within the bottom gutter. Rotates -45° when there are
     * more than 8 entries or labels are long; transform-origin anchors at
     * the top-right corner so the rotated label hangs down-and-left from
     * its slot center (mirrors the prior SVG `text-anchor="end"` behavior).
     */
    get htmlXAxisLabels() {
        if (!this.hasHtmlAxisLabels) return [];
        const data = this.effectiveChartData;
        if (!Array.isArray(data) || data.length === 0) return [];

        const count = data.length;
        const useBarSlots = this.isBarChart || this.isStackedChart || this.normalizedChartType === 'column';
        const slotWidthPct = useBarSlots ? 100 / count : 100 / Math.max(1, count - 1);

        const avgLen = data.reduce((s, i) => s + (String(i.label || '').length), 0) / count;
        const dense = count > 8 || avgLen > 8;

        return data.map((item, idx) => {
            const centerPct = useBarSlots
                ? slotWidthPct * idx + slotWidthPct / 2
                : slotWidthPct * idx;
            const transform = dense
                ? 'translateX(-100%) rotate(-45deg)'
                : 'translateX(-50%)';
            const transformOrigin = dense ? 'top right' : 'top center';
            return {
                id: `xlabel-${idx}`,
                label: item.label || '',
                style: `left: ${centerPct}%; transform: ${transform}; transform-origin: ${transformOrigin};`
            };
        });
    }

    // ========================================
    // COLOR + AXIS FORMATTING HELPERS
    // ========================================

    validateColor(color) {
        if (!color || typeof color !== 'string') return '#CCCCCC';
        if (/^[a-zA-Z0-9#(),.%\-\s]+$/.test(color)) return color;
        // eslint-disable-next-line no-console
        console.warn(`sliickCharts: invalid color "${color}"`);
        return '#CCCCCC';
    }

    getColor(item, index) {
        const raw = item.color || this.activePalette[index % this.activePalette.length];
        return this.validateColor(raw);
    }

    /** Format a numeric value per yAxisFormat. */
    formatValue(value) {
        if (value == null || Number.isNaN(value)) return '';
        const n = Number(value);
        try {
            if (this.yAxisFormat === 'currency') {
                return new Intl.NumberFormat(undefined, {
                    style: 'currency', currency: this.currencyCode || 'USD',
                    maximumFractionDigits: 2
                }).format(n);
            }
            if (this.yAxisFormat === 'percent') {
                return new Intl.NumberFormat(undefined, {
                    style: 'percent', maximumFractionDigits: 1
                }).format(n / 100);
            }
            if (this.yAxisFormat === 'compact') {
                return new Intl.NumberFormat(undefined, {
                    notation: 'compact', maximumFractionDigits: 1
                }).format(n);
            }
            return new Intl.NumberFormat().format(n);
        } catch (_e) {
            return String(n);
        }
    }

    // ========================================
    // CIRCULAR CHARTS (donut, pie)
    // ========================================

    degreesToRadians(d) { return (d * Math.PI) / 180; }
    getX(angle, r) { return r * Math.cos(this.degreesToRadians(angle)); }
    getY(angle, r) { return r * Math.sin(this.degreesToRadians(angle)); }

    get circularSegments() {
        if (!this.isCircularChart) return [];
        const data = this.effectiveChartData;
        if (!Array.isArray(data) || this.totalValue === 0) return [];
        const segs = [];
        let cum = -90;
        data.forEach((item, idx) => {
            const pct = (item.value / this.totalValue) * 100;
            const angle = (item.value / this.totalValue) * 360;
            const full = angle >= 359.99;
            const color = this.getColor(item, idx);
            segs.push({
                id: `segment-${idx}`,
                label: item.label,
                value: item.value,
                formattedValue: this.formatValue(item.value),
                percentage: pct.toFixed(1),
                color,
                legendColorStyle: `background-color: ${color}`,
                pathData: this.calculateArcPath(cum, cum + angle, full)
            });
            cum += angle;
        });
        return segs;
    }

    calculateArcPath(startAngle, endAngle, isFullCircle) {
        const oR = this.OUTER_RADIUS;
        const iR = this.innerRadius;
        if (isFullCircle) return this.calculateFullCirclePath(oR, iR);
        const oSX = this.getX(startAngle, oR);
        const oSY = this.getY(startAngle, oR);
        const oEX = this.getX(endAngle, oR);
        const oEY = this.getY(endAngle, oR);
        const iSX = this.getX(startAngle, iR);
        const iSY = this.getY(startAngle, iR);
        const iEX = this.getX(endAngle, iR);
        const iEY = this.getY(endAngle, iR);
        const largeArc = (endAngle - startAngle) > 180 ? 1 : 0;
        if (iR === 0) {
            return [
                `M 0 0`,
                `L ${oSX} ${oSY}`,
                `A ${oR} ${oR} 0 ${largeArc} 1 ${oEX} ${oEY}`,
                'Z'
            ].join(' ');
        }
        return [
            `M ${oSX} ${oSY}`,
            `A ${oR} ${oR} 0 ${largeArc} 1 ${oEX} ${oEY}`,
            `L ${iEX} ${iEY}`,
            `A ${iR} ${iR} 0 ${largeArc} 0 ${iSX} ${iSY}`,
            'Z'
        ].join(' ');
    }

    calculateFullCirclePath(oR, iR) {
        if (iR === 0) {
            return [
                `M 0 ${-oR}`,
                `A ${oR} ${oR} 0 1 1 0 ${oR}`,
                `A ${oR} ${oR} 0 1 1 0 ${-oR}`, 'Z'
            ].join(' ');
        }
        return [
            `M 0 ${-oR}`,
            `A ${oR} ${oR} 0 1 1 0 ${oR}`,
            `A ${oR} ${oR} 0 1 1 0 ${-oR}`,
            `M 0 ${-iR}`,
            `A ${iR} ${iR} 0 1 0 0 ${iR}`,
            `A ${iR} ${iR} 0 1 0 0 ${-iR}`, 'Z'
        ].join(' ');
    }

    // ========================================
    // BAR / COLUMN CHARTS
    // ========================================

    get barSegments() {
        if (!this.isBarChart) return [];
        const data = this.effectiveChartData;
        if (!Array.isArray(data) || data.length === 0) return [];
        const vertical = this.normalizedChartType === 'column';
        const count = data.length;
        const spacing = 10;
        const totalWidth = this.CHART_BOUNDS * 2;
        const barWidth = (totalWidth / count) - spacing;
        const maxVal = this.maxValue || 1;
        return data.map((item, idx) => {
            const barHeight = (item.value / maxVal) * this.MAX_CHART_HEIGHT;
            const color = this.getColor(item, idx);
            if (vertical) {
                return {
                    id: `bar-${idx}`,
                    label: item.label,
                    value: item.value,
                    formattedValue: this.formatValue(item.value),
                    color,
                    x: -this.CHART_BOUNDS + (idx * (barWidth + spacing)),
                    y: this.CHART_BOUNDS - barHeight,
                    width: barWidth,
                    height: barHeight,
                    legendColorStyle: `background-color: ${color}`
                };
            }
            const maxBarWidth = (this.CHART_BOUNDS * 2) - this.HORIZONTAL_BAR_PADDING;
            const barLength = (item.value / maxVal) * maxBarWidth;
            return {
                id: `bar-${idx}`,
                label: item.label,
                value: item.value,
                formattedValue: this.formatValue(item.value),
                color,
                x: -this.CHART_BOUNDS,
                y: -this.CHART_BOUNDS + (idx * (barWidth + spacing)),
                width: barLength,
                height: barWidth,
                legendColorStyle: `background-color: ${color}`
            };
        });
    }

    // ========================================
    // LINE / AREA CHARTS
    // ========================================

    get lineChartData() {
        if (!this.isLineChart) return { path: '', points: [], area: '' };
        const data = this.effectiveChartData;
        if (!Array.isArray(data) || data.length === 0) return { path: '', points: [], area: '' };
        const count = data.length;
        const totalWidth = this.CHART_BOUNDS * 2;
        const single = count === 1;
        const spacing = single ? 0 : totalWidth / (count - 1);
        const maxVal = this.maxValue || 1;
        const points = data.map((item, idx) => {
            const x = single ? 0 : -this.CHART_BOUNDS + (idx * spacing);
            const y = this.CHART_BOUNDS - ((item.value / maxVal) * this.MAX_CHART_HEIGHT);
            const color = this.getColor(item, idx);
            return {
                id: `point-${idx}`,
                label: item.label,
                value: item.value,
                formattedValue: this.formatValue(item.value),
                x, y, color,
                legendColorStyle: `background-color: ${color}`
            };
        });
        const cmds = points.map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`));
        const path = cmds.join(' ');
        let area = '';
        if (this.normalizedChartType === 'area' && points.length > 0) {
            area = [
                ...cmds,
                `L ${points[points.length - 1].x} ${this.CHART_BOUNDS}`,
                `L ${points[0].x} ${this.CHART_BOUNDS}`, 'Z'
            ].join(' ');
        }
        return { path, points, area };
    }

    // ========================================
    // SPARKLINE (1.3.0)
    // ========================================

    /** Single-series mini-line with no axes, legend, or labels.
     *  Designed for inline use next to a KPI tile. */
    get sparklineData() {
        if (!this.isSparkline) return { path: '', points: [], lastValue: '' };
        const data = this.effectiveChartData;
        if (!Array.isArray(data) || data.length === 0) {
            return { path: '', points: [], lastValue: '' };
        }
        const count = data.length;
        const total = this.CHART_BOUNDS * 2;
        const single = count === 1;
        const spacing = single ? 0 : total / (count - 1);
        const max = this.maxValue || 1;
        const min = Math.min(...data.map(d => d.value));
        const range = (max - min) || 1;
        const points = data.map((item, idx) => {
            const x = single ? 0 : -this.CHART_BOUNDS + (idx * spacing);
            const norm = (item.value - min) / range;
            const y = this.CHART_BOUNDS - (norm * this.MAX_CHART_HEIGHT);
            return {
                id: `spark-${idx}`,
                label: item.label,
                value: item.value,
                formattedValue: this.formatValue(item.value),
                x, y
            };
        });
        const path = points
            .map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`))
            .join(' ');
        const last = points[points.length - 1];
        return {
            path,
            points,
            lastPointX: last ? last.x : 0,
            lastPointY: last ? last.y : 0,
            lastValue: last ? last.formattedValue : ''
        };
    }

    // ========================================
    // STACKED COLUMN / BAR (1.3.0)
    // ========================================

    /** Stacked series — each category is a list of segments rendered top-of-stack. */
    get stackedSegments() {
        if (!this.isStackedChart) return [];
        const data = this.effectiveChartData;
        if (!Array.isArray(data) || data.length === 0) return [];
        const vertical = this.normalizedChartType === 'stackedcolumn';
        const count = data.length;
        const spacing = 10;
        const totalWidth = this.CHART_BOUNDS * 2;
        const barWidth = (totalWidth / count) - spacing;
        const maxStack = Math.max(...data.map(d => d.segments.reduce((t, s) => t + s.value, 0))) || 1;
        const groups = [];
        data.forEach((cat, gi) => {
            let runningTop = this.CHART_BOUNDS; // vertical: pixel-bottom = +CHART_BOUNDS
            let runningLeft = -this.CHART_BOUNDS;
            const segs = [];
            cat.segments.forEach((seg, si) => {
                const segLen = (seg.value / maxStack) * (vertical ? this.MAX_CHART_HEIGHT : this.MAX_CHART_HEIGHT);
                if (vertical) {
                    segs.push({
                        id: `stack-${gi}-${si}`,
                        name: seg.name,
                        label: cat.label,
                        value: seg.value,
                        formattedValue: this.formatValue(seg.value),
                        color: this.validateColor(seg.color),
                        x: -this.CHART_BOUNDS + (gi * (barWidth + spacing)),
                        y: runningTop - segLen,
                        width: barWidth,
                        height: segLen
                    });
                    runningTop -= segLen;
                } else {
                    segs.push({
                        id: `stack-${gi}-${si}`,
                        name: seg.name,
                        label: cat.label,
                        value: seg.value,
                        formattedValue: this.formatValue(seg.value),
                        color: this.validateColor(seg.color),
                        x: runningLeft,
                        y: -this.CHART_BOUNDS + (gi * (barWidth + spacing)),
                        width: segLen,
                        height: barWidth
                    });
                    runningLeft += segLen;
                }
            });
            groups.push({ id: `group-${gi}`, label: cat.label, segments: segs });
        });
        return groups;
    }

    /** Flattened legend for stacked charts — one entry per unique series name. */
    get stackedLegend() {
        if (!this.isStackedChart) return [];
        const seen = new Map();
        for (const group of this.stackedSegments) {
            for (const seg of group.segments) {
                if (!seen.has(seg.name)) {
                    seen.set(seg.name, {
                        id: `legend-${seen.size}`,
                        name: seg.name,
                        color: seg.color,
                        legendColorStyle: `background-color: ${seg.color}`
                    });
                }
            }
        }
        return Array.from(seen.values());
    }

    /** Flat list (template iteration helper) — every stacked segment as a leaf. */
    get stackedSegmentsFlat() {
        const out = [];
        for (const g of this.stackedSegments) for (const s of g.segments) out.push(s);
        return out;
    }

    // ========================================
    // HEATMAP (1.3.0)
    // ========================================

    /** Heatmap cells — fills entire viewBox. data shape: [{row, col, value, label?}] */
    get heatmapData() {
        if (!this.isHeatmap) return { cells: [], rows: 0, cols: 0 };
        const data = this.effectiveChartData;
        if (!Array.isArray(data) || data.length === 0) return { cells: [], rows: 0, cols: 0 };
        const maxRow = Math.max(...data.map(d => d.row));
        const maxCol = Math.max(...data.map(d => d.col));
        const rows = maxRow + 1;
        const cols = maxCol + 1;
        const max = this.maxValue || 1;
        const cellW = (this.CHART_BOUNDS * 2) / cols;
        const cellH = (this.CHART_BOUNDS * 2) / rows;
        const cells = data.map((d, idx) => {
            const intensity = Math.min(1, d.value / max);
            const paletteIdx = Math.floor(intensity * (this.HEATMAP_PALETTE.length - 1));
            return {
                id: `cell-${idx}`,
                label: d.label || `${d.row},${d.col}`,
                value: d.value,
                formattedValue: this.formatValue(d.value),
                x: -this.CHART_BOUNDS + d.col * cellW,
                y: -this.CHART_BOUNDS + d.row * cellH,
                width: cellW - 1,
                height: cellH - 1,
                color: this.HEATMAP_PALETTE[paletteIdx]
            };
        });
        return { cells, rows, cols };
    }

    // ========================================
    // GRID LINES + AXIS LABELS
    // ========================================

    get gridLines() {
        if (this.hideGridLines || this.isCircularChart || this.isSparkline || this.isHeatmap) return [];
        const lines = [];
        const vertical = this.normalizedChartType === 'column' || this.isLineChart ||
            this.normalizedChartType === 'stackedcolumn';
        for (let i = 0; i <= 4; i++) {
            const pos = -this.CHART_BOUNDS + (i * this.GRID_SPACING);
            if (vertical) {
                lines.push({ id: `grid-${i}`, x1: -this.CHART_BOUNDS, y1: pos, x2: this.CHART_BOUNDS, y2: pos });
            } else {
                lines.push({ id: `grid-${i}`, x1: pos, y1: -this.CHART_BOUNDS, x2: pos, y2: this.CHART_BOUNDS });
            }
        }
        return lines;
    }

    // ========================================
    // TOOLTIPS + EVENTS
    // ========================================

    calculateTooltipPosition(containerRect, targetRect) {
        return {
            x: targetRect.left - containerRect.left + (targetRect.width / 2),
            y: targetRect.top - containerRect.top - 10
        };
    }

    handleMouseEnter(event) {
        const elementId = event.target.dataset.id;
        if (!elementId) return;
        let element;
        if (elementId.startsWith('segment-')) {
            element = this.circularSegments[parseInt(elementId.replace('segment-', ''), 10)];
        } else if (elementId.startsWith('bar-')) {
            element = this.barSegments[parseInt(elementId.replace('bar-', ''), 10)];
        } else if (elementId.startsWith('point-')) {
            element = this.lineChartData.points[parseInt(elementId.replace('point-', ''), 10)];
        } else if (elementId.startsWith('spark-')) {
            element = this.sparklineData.points[parseInt(elementId.replace('spark-', ''), 10)];
        } else if (elementId.startsWith('stack-')) {
            element = this.stackedSegmentsFlat.find(s => s.id === elementId);
        } else if (elementId.startsWith('cell-')) {
            element = this.heatmapData.cells[parseInt(elementId.replace('cell-', ''), 10)];
        }
        if (!element) return;
        this.tooltipData = {
            label: element.label,
            value: element.formattedValue || element.value,
            percentage: element.percentage ||
                (this.totalValue ? ((element.value / this.totalValue) * 100).toFixed(1) : '0')
        };
        const container = this.template.querySelector('.chart-container');
        if (container) {
            const containerRect = container.getBoundingClientRect();
            const targetRect = event.target.getBoundingClientRect();
            this.tooltipPosition = this.calculateTooltipPosition(containerRect, targetRect);
        }
        this.showTooltip = true;
        event.target.classList.add('element-hover');
    }

    handleMouseLeave(event) {
        this.showTooltip = false;
        event.target.classList.remove('element-hover');
    }

    /**
     * Click on a chart segment/bar/point. Dispatches a composed/bubbling
     * `chartclick` CustomEvent with `{ label, value, index, type, name? }`
     * so host LWCs can drill down. 1.3.0.
     */
    handleChartClick(event) {
        const id = event.currentTarget.dataset.id;
        if (!id) return;
        let detail = null;
        if (id.startsWith('segment-')) {
            const idx = parseInt(id.replace('segment-', ''), 10);
            const s = this.circularSegments[idx];
            if (s) detail = { label: s.label, value: s.value, index: idx, type: 'segment' };
        } else if (id.startsWith('bar-')) {
            const idx = parseInt(id.replace('bar-', ''), 10);
            const b = this.barSegments[idx];
            if (b) detail = { label: b.label, value: b.value, index: idx, type: 'bar' };
        } else if (id.startsWith('point-')) {
            const idx = parseInt(id.replace('point-', ''), 10);
            const p = this.lineChartData.points[idx];
            if (p) detail = { label: p.label, value: p.value, index: idx, type: 'point' };
        } else if (id.startsWith('spark-')) {
            const idx = parseInt(id.replace('spark-', ''), 10);
            const p = this.sparklineData.points[idx];
            if (p) detail = { label: p.label, value: p.value, index: idx, type: 'sparkPoint' };
        } else if (id.startsWith('stack-')) {
            const s = this.stackedSegmentsFlat.find(x => x.id === id);
            if (s) detail = { label: s.label, value: s.value, name: s.name, type: 'stackedSegment' };
        } else if (id.startsWith('cell-')) {
            const idx = parseInt(id.replace('cell-', ''), 10);
            const c = this.heatmapData.cells[idx];
            if (c) detail = { label: c.label, value: c.value, index: idx, type: 'heatmapCell' };
        }
        if (!detail) return;
        this.dispatchEvent(new CustomEvent('chartclick', {
            detail,
            bubbles: true,
            composed: true
        }));
    }

    handleLogoClick() {
        window.open(this.SLIICK_URL, '_blank', 'noopener,noreferrer');
    }
}
