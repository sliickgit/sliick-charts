import { LightningElement, api, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import SLIICK_LOGO from '@salesforce/resourceUrl/SliickChartsLogo';

/**
 * @description A reusable multi-chart component built with native SVG.
 *              Supports donut, pie, bar, column, line, and area charts without external libraries.
 * @author Jerry Huang
 * @date 2025-12-16
 */
export default class sliickCharts extends LightningElement {
    // ========================================
    // PUBLIC API PROPERTIES
    // ========================================

    /**
     * @description Type of chart to render
     * @type {string}
     * @default 'donut'
     * @example 'donut' | 'pie' | 'bar' | 'column' | 'line' | 'area'
     */
    @api chartType = 'Donut';

    /**
     * @description Chart data array containing label and value pairs
     * @type {Array<{label: string, value: number}>}
     * @example [{ label: 'Sales', value: 100 }, { label: 'Marketing', value: 50 }]
     */
    @api chartData = [];

    /**
     * @description JSON string for chart data (used in App Builder)
     * @type {string}
     * @example '[{"label":"Name","value":100}]'
     */
    @api chartDataJson = '';

    /**
     * @description Size of the chart in pixels (width and height)
     * @type {number}
     * @default 300
     */
    @api chartSize = 300;

    /**
     * @description Thickness of the donut ring in SVG units (donut charts only)
     * @type {number}
     * @default 50
     */
    @api donutThickness = 50;

    /**
     * @description Optional title displayed above the chart
     * @type {string}
     */
    @api chartTitle = '';

    /**
     * @description Whether to hide the legend below the chart
     * @type {boolean}
     * @default false
     */
    @api hideLegend = false;

    /**
     * @description Whether to hide percentage values in the legend
     * @type {boolean}
     * @default false
     */
    @api hidePercentages = false;

    /**
     * @description Text label to display in the center (donut/pie charts only)
     * @type {string}
     */
    @api centerLabel = '';

    /**
     * @description Value to display in the center (donut/pie charts only)
     * @type {string}
     */
    @api centerValue = '';



    /**
     * @description Whether to hide data points on line/area charts
     * @type {boolean}
     * @default false
     */
    @api hideDataPoints = false;

    /**
     * @description Whether to hide grid lines on bar/column/line/area charts
     * @type {boolean}
     * @default false
     */
    @api hideGridLines = false;

    /**
     * @description Whether the chart should take up 100% of the container width
     * @type {boolean}
     * @default false
     */
    @api responsive = false;

    /**
     * @description Whether to hide the Sliick logo in the chart footer
     * @type {boolean}
     * @default false
     */
    @api hideLogo = false;

    // ========================================
    // PRIVATE TRACKED PROPERTIES
    // ========================================

    /**
     * @description Computed getter for showLegend (inverted from hideLegend)
     * @return {boolean} True if legend should be shown
     */
    get showLegend() {
        return !this.hideLegend;
    }

    /**
     * @description Computed getter for showPercentages (inverted from hidePercentages)
     * @return {boolean} True if percentages should be shown
     */
    get showPercentages() {
        return !this.hidePercentages;
    }

    /**
     * @description Computed getter for showLogo (inverted from hideLogo)
     * @return {boolean} True if logo should be shown
     */
    get showLogo() {
        return !this.hideLogo;
    }

    /**
     * @description Tracked variable to control tooltip visibility
     * @type {boolean}
     */
    @track showTooltip = false;

    /**
     * @description Tracked variable containing tooltip data
     * @type {{label: string, value: number, percentage: string}}
     */
    @track tooltipData = {
        label: '',
        value: 0,
        percentage: '0'
    };

    /**
     * @description Tracked variable for tooltip position
     * @type {{x: number, y: number}}
     */
    @track tooltipPosition = { x: 0, y: 0 };

    // ========================================
    // CONSTANTS
    // ========================================

    /**
     * @description Standard Salesforce chart colors for segments
     * @type {string[]}
     */
    CHART_COLORS = [
        '#5EB4FF', // Salesforce Blue Light
        '#3AE867', // Green
        '#FFC838', // Yellow/Gold
        '#FF7346', // Orange
        '#E287F5', // Purple/Pink
        '#47C9F2', // Cyan
        '#FF5D5D', // Red
        '#7DD387'  // Light Green
    ];

    /**
     * @description Outer radius of the donut/pie chart in SVG units
     *              Based on the viewBox of -100 to 100, max radius is ~90
     * @type {number}
     */
    OUTER_RADIUS = 90;

    /**
     * @description Chart plotting area boundary (absolute value from center)
     * @type {number}
     */
    CHART_BOUNDS = 90;

    /**
     * @description Max height for bars/lines in current coordinate system
     *              (Currently using roughly half the vertical space, 10 to 90)
     * @type {number}
     */
    MAX_CHART_HEIGHT = 80;

    /**
     * @description Spacing between grid lines
     * @type {number}
     */
    GRID_SPACING = 45;

    /**
     * @description Valid chart types
     * @type {string[]}
     */
    VALID_CHART_TYPES = ['donut', 'pie', 'bar', 'column', 'line', 'area'];

    /**
     * @description Padding for horizontal bar charts to prevent clipping
     * @type {number}
     */
    HORIZONTAL_BAR_PADDING = 20;

    /**
     * @description External URL for the Sliick website, opened when the logo is clicked
     * @type {string}
     */
    SLIICK_URL = 'https://sliick.com';

    // ========================================
    // SHARED COMPUTED PROPERTIES & UTILITIES
    // ========================================

    /**
     * @description Returns whether the chart has a title to display
     * @return {boolean} True if chartTitle is not empty
     */
    get hasTitle() {
        return !!this.chartTitle;
    }

    /**
     * @description Returns whether to show center content
     * @return {boolean} True if centerLabel or centerValue is not empty
     */
    get hasCenterContent() {
        return !!this.centerLabel || !!this.centerValue;
    }

    /**
     * @description Returns the URL for the Sliick logo
     * @return {string} Logo URL
     */
    /**
     * @description Returns the URL for the Sliick logo
     * @return {string} Logo URL
     */
    get logoUrl() {
        return SLIICK_LOGO;
    }



    /**
     * @description Gets the effective chart data, merging dataJson if provided
     * @return {Array<{label: string, value: number}>} Array of chart data objects
     */
    get effectiveChartData() {
        // If chartDataJson is provided, parse and use it
        if (this.chartDataJson && typeof this.chartDataJson === 'string' && this.chartDataJson.trim()) {
            try {
                const parsed = JSON.parse(this.chartDataJson);
                if (Array.isArray(parsed)) {
                    return this.sanitiseChartData(parsed);
                }
            } catch (e) {
                console.error('sliickCharts: Invalid JSON in chartDataJson property', e);
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error Parsing Chart Data',
                        message: 'Invalid JSON provided in Chart Data. Please check the format.',
                        variant: 'error'
                    })
                );
            }
        }
        // Fall back to chartData
        return this.sanitiseChartData(this.chartData || []);
    }

    /**
     * @description Validates and sanitises chart data items, coercing values to numbers
     *              and filtering out items with non-numeric or negative values.
     * @param {Array<{label: string, value: *}>} data Raw chart data array
     * @return {Array<{label: string, value: number}>} Sanitised array with valid numeric values
     */
    sanitiseChartData(data) {
        if (!Array.isArray(data)) {
            return [];
        }

        return data.reduce((result, item, index) => {
            const numericValue = parseFloat(item.value);

            if (Number.isNaN(numericValue)) {
                console.warn(
                    `sliickCharts: Non-numeric value "${item.value}" at index ${index} (label: "${item.label}") - item excluded`
                );
                return result;
            }

            result.push({ ...item, value: numericValue });
            return result;
        }, []);
    }

    /**
     * @description Gets the normalized chart type (lowercase and validated)
     * @return {string} Valid chart type or 'donut' as default
     */
    get normalizedChartType() {
        const type = (this.chartType || 'donut').toLowerCase();
        return this.VALID_CHART_TYPES.includes(type) ? type : 'donut';
    }

    /**
     * @description Returns true if chart is a circular type (donut or pie)
     * @return {boolean} True for donut/pie charts
     */
    get isCircularChart() {
        return this.normalizedChartType === 'donut' || this.normalizedChartType === 'pie';
    }

    /**
     * @description Returns true if chart is a bar type (bar or column)
     * @return {boolean} True for bar/column charts
     */
    get isBarChart() {
        return this.normalizedChartType === 'bar' || this.normalizedChartType === 'column';
    }

    /**
     * @description Returns true if chart is a line type (line or area)
     * @return {boolean} True for line/area charts
     */
    get isLineChart() {
        return this.normalizedChartType === 'line' || this.normalizedChartType === 'area';
    }

    /**
     * @description Calculates the inner radius based on donut thickness
     * @return {number} Inner radius value
     */
    get innerRadius() {
        if (this.normalizedChartType === 'pie') {
            return 0; // Pie chart has no inner radius
        }
        return Math.max(0, this.OUTER_RADIUS - this.donutThickness);
    }

    /**
     * @description Sets CSS variables after component renders
     * @return {void}
     */
    renderedCallback() {
        const chartWrapper = this.template.querySelector('.chart-wrapper');
        const tooltip = this.template.querySelector('.tooltip');

        if (chartWrapper) {
            if (this.responsive) {
                chartWrapper.style.setProperty('--chart-size', '100%');
                chartWrapper.style.width = '100%';
                // When responsive, set width to 100% of container.
                // Height remains fixed to chartSize to ensure consistent vertical sizing.
                chartWrapper.style.height = `${this.chartSize}px`;
            } else {
                chartWrapper.style.setProperty('--chart-size', `${this.chartSize}px`);
                chartWrapper.style.width = `${this.chartSize}px`;
                chartWrapper.style.height = `${this.chartSize}px`;
            }
        }

        if (tooltip) {
            tooltip.style.left = `${this.tooltipPosition.x}px`;
            tooltip.style.top = `${this.tooltipPosition.y}px`;
        }
    }

    /**
     * @description Calculates the total sum of all values in chartData
     * @return {number} Total sum of values
     */
    get totalValue() {
        const data = this.effectiveChartData;
        if (!data || !Array.isArray(data)) {
            return 0;
        }
        return data.reduce((sum, item) => sum + parseFloat(item.value || 0), 0);
    }

    /**
     * @description Gets the maximum value in the dataset
     * @return {number} Maximum value
     */
    get maxValue() {
        const data = this.effectiveChartData;
        if (!data || !Array.isArray(data) || data.length === 0) {
            return 0;
        }
        return Math.max(...data.map(item => parseFloat(item.value || 0)));
    }



    /**
     * @description Gets the primary color from the palette
     * @return {string} Primary color code
     */
    get primaryColor() {
        const data = this.effectiveChartData;
        if (data && data.length > 0 && data[0].color) {
            return this.validateColor(data[0].color);
        }
        return this.CHART_COLORS[0];
    }

    // ========================================
    // CIRCULAR CHART METHODS (DONUT/PIE)
    // ========================================

    /**
     * @description Validates a color string to prevent CSS injection
     * @param {string} color Color string to validate
     * @return {string} Validated color or fallback
     */
    validateColor(color) {
        if (!color || typeof color !== 'string') {
            return '#CCCCCC'; // Fallback
        }

        // Basic validation: ensure it doesn't contain dangerous characters
        // Allowed: alphanumeric, #, (), ,, ., %, spaces, -
        // Disallowed: ; } { < > " ' `
        const safeColorRegex = /^[a-zA-Z0-9#(),.%\-\s]+$/;

        if (safeColorRegex.test(color)) {
            return color;
        }

        console.warn(`sliickCharts: Invalid color value ignored: "${color}"`);
        return '#CCCCCC';
    }

    /**
     * @description Helper to get the valid color for a data item
     * @param {Object} item Chart data item
     * @param {number} index Index of the item
     * @return {string} Validated color
     */
    getColor(item, index) {
        // Use color from item if available, otherwise cyclic default color
        const rawColor = item.color || this.CHART_COLORS[index % this.CHART_COLORS.length];
        return this.validateColor(rawColor);
    }

    /**
     * @description Generates the segment data with SVG path information for circular charts
     * @return {Array<Object>} Array of segment objects with path data
     */
    get circularSegments() {
        if (!this.isCircularChart) {
            return [];
        }

        const data = this.effectiveChartData;
        if (!data || !Array.isArray(data) || this.totalValue === 0) {
            return [];
        }

        const segments = [];
        let cumulativeAngle = -90; // Start from top (12 o'clock position)

        data.forEach((item, index) => {
            const percentage = (item.value / this.totalValue) * 100;
            const angleDegrees = (item.value / this.totalValue) * 360;

            // Handle edge case: single slice that is 100%
            const isFullCircle = angleDegrees >= 359.99;

            const segmentColor = this.getColor(item, index);

            const segment = {
                id: `segment-${index}`,
                label: item.label,
                value: item.value,
                percentage: percentage.toFixed(1),
                color: segmentColor,
                legendColorStyle: `background-color: ${segmentColor}`,
                pathData: this.calculateArcPath(
                    cumulativeAngle,
                    cumulativeAngle + angleDegrees,
                    isFullCircle
                )
            };

            segments.push(segment);
            cumulativeAngle += angleDegrees;
        });

        return segments;
    }

    /**
     * @description Converts degrees to radians
     * @param {number} degrees Angle in degrees
     * @return {number} Angle in radians
     */
    degreesToRadians(degrees) {
        return (degrees * Math.PI) / 180;
    }

    /**
     * @description Calculates X coordinate on circle given angle and radius
     * @param {number} angleDegrees Angle in degrees
     * @param {number} radius Radius of the circle
     * @return {number} X coordinate
     */
    getX(angleDegrees, radius) {
        return radius * Math.cos(this.degreesToRadians(angleDegrees));
    }

    /**
     * @description Calculates Y coordinate on circle given angle and radius
     * @param {number} angleDegrees Angle in degrees
     * @param {number} radius Radius of the circle
     * @return {number} Y coordinate
     */
    getY(angleDegrees, radius) {
        return radius * Math.sin(this.degreesToRadians(angleDegrees));
    }

    /**
     * @description Generates the SVG path data for a donut/pie arc segment
     *              Uses the arc command (A) with inner and outer radii
     * @param {number} startAngle Start angle in degrees
     * @param {number} endAngle End angle in degrees
     * @param {boolean} isFullCircle Whether this segment is a complete circle
     * @return {string} SVG path d attribute value
     */
    calculateArcPath(startAngle, endAngle, isFullCircle) {
        const outerRadius = this.OUTER_RADIUS;
        const innerRadius = this.innerRadius;

        // For a full circle, we need to draw two arcs
        if (isFullCircle) {
            return this.calculateFullCirclePath(outerRadius, innerRadius);
        }

        // Calculate start and end points for outer arc
        const outerStartX = this.getX(startAngle, outerRadius);
        const outerStartY = this.getY(startAngle, outerRadius);
        const outerEndX = this.getX(endAngle, outerRadius);
        const outerEndY = this.getY(endAngle, outerRadius);

        // Calculate start and end points for inner arc
        const innerStartX = this.getX(startAngle, innerRadius);
        const innerStartY = this.getY(startAngle, innerRadius);
        const innerEndX = this.getX(endAngle, innerRadius);
        const innerEndY = this.getY(endAngle, innerRadius);

        // Determine if arc should be drawn the long way (large-arc-flag)
        const angleDiff = endAngle - startAngle;
        const largeArcFlag = angleDiff > 180 ? 1 : 0;

        // Build the path:
        // 1. Move to outer start point
        // 2. Arc to outer end point
        // 3. Line to inner end point (or center for pie)
        // 4. Arc back to inner start point (or line for pie)
        // 5. Close path
        if (innerRadius === 0) {
            // Pie chart segment
            const path = [
                `M 0 0`,
                `L ${outerStartX} ${outerStartY}`,
                `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${outerEndX} ${outerEndY}`,
                'Z'
            ].join(' ');
            return path;
        } else {
            // Donut chart segment
            const path = [
                `M ${outerStartX} ${outerStartY}`,
                `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${outerEndX} ${outerEndY}`,
                `L ${innerEndX} ${innerEndY}`,
                `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${innerStartX} ${innerStartY}`,
                'Z'
            ].join(' ');
            return path;
        }
    }

    /**
     * @description Generates path for a complete circle (100% segment)
     *              SVG arcs cannot draw a full circle in one command, so we use two semicircles
     * @param {number} outerRadius Outer radius of the donut
     * @param {number} innerRadius Inner radius of the donut
     * @return {string} SVG path d attribute value
     */
    calculateFullCirclePath(outerRadius, innerRadius) {
        // Draw two semicircles to create a full circle
        // Outer circle: from top, around right, to bottom, then around left back to top
        // Inner circle: same but in reverse direction

        if (innerRadius === 0) {
            // Full pie chart (just a circle)
            const path = [
                `M 0 ${-outerRadius}`,
                `A ${outerRadius} ${outerRadius} 0 1 1 0 ${outerRadius}`,
                `A ${outerRadius} ${outerRadius} 0 1 1 0 ${-outerRadius}`,
                'Z'
            ].join(' ');
            return path;
        } else {
            // Full donut chart
            const path = [
                // Start at top of outer circle
                `M 0 ${-outerRadius}`,
                // Arc to bottom of outer circle (right side)
                `A ${outerRadius} ${outerRadius} 0 1 1 0 ${outerRadius}`,
                // Arc back to top of outer circle (left side)
                `A ${outerRadius} ${outerRadius} 0 1 1 0 ${-outerRadius}`,
                // Move to top of inner circle
                `M 0 ${-innerRadius}`,
                // Arc to bottom of inner circle (left side - reverse direction)
                `A ${innerRadius} ${innerRadius} 0 1 0 0 ${innerRadius}`,
                // Arc back to top of inner circle (right side)
                `A ${innerRadius} ${innerRadius} 0 1 0 0 ${-innerRadius}`,
                'Z'
            ].join(' ');
            return path;
        }
    }

    // ========================================
    // BAR/COLUMN CHART METHODS
    // ========================================

    /**
     * @description Generates bar/column chart data
     * @return {Array<Object>} Array of bar objects with dimensions
     */
    get barSegments() {
        if (!this.isBarChart) {
            return [];
        }

        const data = this.effectiveChartData;
        if (!data || !Array.isArray(data) || data.length === 0) {
            return [];
        }

        const isVertical = this.normalizedChartType === 'column';
        const barCount = data.length;
        const barSpacing = 10;
        // Total available width: CHART_BOUNDS * 2 (e.g., 90*2 = 180)
        const totalWidth = this.CHART_BOUNDS * 2;
        const barWidth = (totalWidth / barCount) - barSpacing;
        const maxVal = this.maxValue || 1;

        return data.map((item, index) => {
            const barHeight = (item.value / maxVal) * this.MAX_CHART_HEIGHT;
            const barColor = this.getColor(item, index);


            if (isVertical) {
                // Column chart (vertical bars)
                return {
                    id: `bar-${index}`,
                    label: item.label,
                    value: item.value,
                    color: barColor,
                    x: -this.CHART_BOUNDS + (index * (barWidth + barSpacing)),
                    y: this.CHART_BOUNDS - barHeight,
                    width: barWidth,
                    height: barHeight,
                    legendColorStyle: `background-color: ${barColor}`
                };
            } else {
                // Bar chart (horizontal bars)
                // Scale bars to occupy the full available width minus padding to prevent clipping
                const maxBarWidth = (this.CHART_BOUNDS * 2) - this.HORIZONTAL_BAR_PADDING;
                const barLength = (item.value / maxVal) * maxBarWidth;
                
                return {
                    id: `bar-${index}`,
                    label: item.label,
                    value: item.value,
                    color: barColor,
                    x: -this.CHART_BOUNDS,
                    y: -this.CHART_BOUNDS + (index * (barWidth + barSpacing)),
                    width: barLength,
                    height: barWidth,
                    legendColorStyle: `background-color: ${barColor}`
                };
            }
        });
    }

    // ========================================
    // LINE/AREA CHART METHODS
    // ========================================

    /**
     * @description Generates line/area chart path data
     * @return {Object} Object containing path and points data
     */
    get lineChartData() {
        if (!this.isLineChart) {
            return { path: '', points: [], area: '' };
        }

        const data = this.effectiveChartData;
        if (!data || !Array.isArray(data) || data.length === 0) {
            return { path: '', points: [], area: '' };
        }

        const pointCount = data.length;
        // Total available width: CHART_BOUNDS * 2 (180)
        const totalWidth = this.CHART_BOUNDS * 2;
        const isSinglePoint = pointCount === 1;
        const spacing = isSinglePoint ? 0 : totalWidth / (pointCount - 1);
        const maxVal = this.maxValue || 1;

        const points = data.map((item, index) => {
            // Centre a single data point horizontally instead of placing at left edge
            const x = isSinglePoint ? 0 : -this.CHART_BOUNDS + (index * spacing);
            const y = this.CHART_BOUNDS - ((item.value / maxVal) * this.MAX_CHART_HEIGHT);
            const color = this.getColor(item, index);

            return {
                id: `point-${index}`,
                label: item.label,
                value: item.value,
                x,
                y,
                color,
                legendColorStyle: `background-color: ${color}`
            };
        });

        // Generate line path
        const pathCommands = points.map((point, index) => {
            return index === 0 ? `M ${point.x} ${point.y}` : `L ${point.x} ${point.y}`;
        });
        const linePath = pathCommands.join(' ');

        // Generate area path (for area charts)
        let areaPath = '';
        if (this.normalizedChartType === 'area' && points.length > 0) {
            const areaCommands = [
                ...pathCommands,
                `L ${points[points.length - 1].x} ${this.CHART_BOUNDS}`, // Down to bottom
                `L ${points[0].x} ${this.CHART_BOUNDS}`, // Across to start
                'Z' // Close path
            ];
            areaPath = areaCommands.join(' ');
        }

        return {
            path: linePath,
            points,
            area: areaPath
        };
    }

    // ========================================
    // SHARED RENDERING HELPERS
    // ========================================

    /**
     * @description Generates grid lines for bar/column/line/area charts
     * @return {Array<Object>} Array of grid line objects
     */
    get gridLines() {
        if (this.hideGridLines || this.isCircularChart) {
            return [];
        }

        const lines = [];
        const isVertical = this.normalizedChartType === 'column' || this.isLineChart;

        // Generate 5 grid lines
        for (let i = 0; i <= 4; i++) {
            const position = -this.CHART_BOUNDS + (i * this.GRID_SPACING); // Every 45 units

            if (isVertical) {
                // Horizontal grid lines for vertical charts
                lines.push({
                    id: `grid-${i}`,
                    x1: -this.CHART_BOUNDS,
                    y1: position,
                    x2: this.CHART_BOUNDS,
                    y2: position
                });
            } else {
                // Vertical grid lines for horizontal charts
                lines.push({
                    id: `grid-${i}`,
                    x1: position,
                    y1: -this.CHART_BOUNDS,
                    x2: position,
                    y2: this.CHART_BOUNDS
                });
            }
        }

        return lines;
    }

    /**
     * @description Calculates tooltip position relative to its container element.
     *              Centres the tooltip horizontally over the target and places it
     *              above the target with a 10-unit offset.
     * @param {DOMRect} containerRect Bounding rect of the tooltip's container
     * @param {DOMRect} targetRect Bounding rect of the hovered chart element
     * @return {{x: number, y: number}} Pixel coordinates for the tooltip
     */
    calculateTooltipPosition(containerRect, targetRect) {
        return {
            x: targetRect.left - containerRect.left + (targetRect.width / 2),
            y: targetRect.top - containerRect.top - 10
        };
    }

    // ========================================
    // EVENT HANDLERS
    // ========================================

    /**
     * @description Handles mouse enter event on a chart element
     *              Shows tooltip with element data
     * @param {Event} event Mouse event
     * @return {void}
     */
    handleMouseEnter(event) {
        const elementId = event.target.dataset.id;
        const elementIndex = parseInt(elementId.replace(/^(segment|bar|point)-/, ''), 10);

        let element;
        if (this.isCircularChart) {
            element = this.circularSegments[elementIndex];
        } else if (this.isBarChart) {
            element = this.barSegments[elementIndex];
        } else if (this.isLineChart) {
            element = this.lineChartData.points[elementIndex];
        }

        if (element) {
            this.tooltipData = {
                label: element.label,
                value: element.value,
                percentage: element.percentage || ((element.value / this.totalValue) * 100).toFixed(1)
            };

            // Calculate tooltip position relative to container
            const container = this.template.querySelector('.chart-container');
            if (container) {
                const containerRect = container.getBoundingClientRect();
                const targetRect = event.target.getBoundingClientRect();
                this.tooltipPosition = this.calculateTooltipPosition(containerRect, targetRect);
            }

            this.showTooltip = true;

            // Add hover class to element
            event.target.classList.add('element-hover');
        }
    }

    /**
     * @description Handles mouse leave event on a chart element
     *              Hides the tooltip
     * @param {Event} event Mouse event
     * @return {void}
     */
    handleMouseLeave(event) {
        this.showTooltip = false;
        event.target.classList.remove('element-hover');
    }

    /**
     * @description Opens the Sliick website in a new tab when the logo is clicked
     * @return {void}
     */
    handleLogoClick() {
        window.open(this.SLIICK_URL, '_blank', 'noopener,noreferrer');
    }
}
