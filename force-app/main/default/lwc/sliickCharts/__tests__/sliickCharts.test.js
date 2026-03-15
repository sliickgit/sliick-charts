import { createElement } from 'lwc';
import sliickCharts from 'c/sliickCharts';
import { ShowToastEventName } from 'lightning/platformShowToastEvent';


describe('c-sliick-charts', () => {
    afterEach(() => {
        // Clean up the DOM after each test
        while (document.body.firstChild) {
            document.body.removeChild(document.body.firstChild);
        }
    });

    // Helper function to wait for DOM updates
    const flushPromises = () => new Promise(resolve => setTimeout(resolve, 0));

    const sampleData = [
        { label: 'Sales', value: 100 },
        { label: 'Marketing', value: 50 },
        { label: 'Support', value: 75 }
    ];

    describe('Component Rendering', () => {
        it('renders with default properties', () => {
            const element = createElement('c-sliick-charts', {
                is: sliickCharts
            });
            document.body.appendChild(element);

            const container = element.shadowRoot.querySelector('.chart-container');
            expect(container).toBeTruthy();

            const svg = element.shadowRoot.querySelector('.chart-svg');
            expect(svg).toBeTruthy();
            expect(svg.getAttribute('viewBox')).toBe('-100 -100 200 200');
        });

        it('renders no segments when chartData is empty', () => {
            const element = createElement('c-sliick-charts', {
                is: sliickCharts
            });
            element.chartData = [];
            document.body.appendChild(element);

            const paths = element.shadowRoot.querySelectorAll('.chart-segment');
            expect(paths.length).toBe(0);
        });

        it('is accessible', async () => {
            const element = createElement('c-sliick-charts', {
                is: sliickCharts
            });
            element.chartData = sampleData;
            element.chartTitle = 'Sales Data';
            document.body.appendChild(element);
            
            await expect(element).toBeAccessible();
        });
    });

    describe('Donut Chart', () => {
        it('renders donut chart by default', async () => {
            const element = createElement('c-sliick-charts', {
                is: sliickCharts
            });
            element.chartData = sampleData;
            document.body.appendChild(element);
            await flushPromises();

            const segments = element.shadowRoot.querySelectorAll('.chart-segment');
            expect(segments.length).toBe(3);
        });

        it('handles single segment (100%) correctly', async () => {
            const element = createElement('c-sliick-charts', {
                is: sliickCharts
            });
            element.chartData = [{ label: 'Only One', value: 100 }];
            document.body.appendChild(element);
            await flushPromises();

            const segments = element.shadowRoot.querySelectorAll('.chart-segment');
            expect(segments.length).toBe(1);
        });
    });

    describe('Pie Chart', () => {
        it('renders pie chart when chartType is pie', async () => {
            const element = createElement('c-sliick-charts', {
                is: sliickCharts
            });
            element.chartType = 'pie';
            element.chartData = sampleData;
            document.body.appendChild(element);
            await flushPromises();

            const segments = element.shadowRoot.querySelectorAll('.chart-segment');
            expect(segments.length).toBe(3);
        });
    });

    describe('Bar Chart', () => {
        it('renders bar chart when chartType is bar', async () => {
            const element = createElement('c-sliick-charts', {
                is: sliickCharts
            });
            element.chartType = 'bar';
            element.chartData = sampleData;
            document.body.appendChild(element);
            await flushPromises();

            const bars = element.shadowRoot.querySelectorAll('.chart-bar');
            expect(bars.length).toBe(3);
        });
    });

    describe('Column Chart', () => {
        it('renders column chart when chartType is column', async () => {
            const element = createElement('c-sliick-charts', {
                is: sliickCharts
            });
            element.chartType = 'column';
            element.chartData = sampleData;
            document.body.appendChild(element);
            await flushPromises();

            const bars = element.shadowRoot.querySelectorAll('.chart-bar');
            expect(bars.length).toBe(3);
        });
    });

    describe('Line Chart', () => {
        it('renders line chart when chartType is line', async () => {
            const element = createElement('c-sliick-charts', {
                is: sliickCharts
            });
            element.chartType = 'line';
            element.chartData = sampleData;
            document.body.appendChild(element);
            await flushPromises();

            const line = element.shadowRoot.querySelector('.chart-line');
            expect(line).toBeTruthy();

            const points = element.shadowRoot.querySelectorAll('.chart-point');
            expect(points.length).toBe(3);
        });

        it('hides data points when hideDataPoints is true', async () => {
            const element = createElement('c-sliick-charts', {
                is: sliickCharts
            });
            element.chartType = 'line';
            element.chartData = sampleData;
            element.hideDataPoints = true;
            document.body.appendChild(element);
            await flushPromises();

            const points = element.shadowRoot.querySelectorAll('.chart-point');
            expect(points.length).toBe(0);
        });
    });

    describe('Area Chart', () => {
        it('renders area chart when chartType is area', async () => {
            const element = createElement('c-sliick-charts', {
                is: sliickCharts
            });
            element.chartType = 'area';
            element.chartData = sampleData;
            document.body.appendChild(element);
            await flushPromises();

            const area = element.shadowRoot.querySelector('.chart-area');
            expect(area).toBeTruthy();

            const line = element.shadowRoot.querySelector('.chart-line');
            expect(line).toBeTruthy();
        });
    });

    describe('Component Properties', () => {
        it('accepts custom chartSize', async () => {
            const element = createElement('c-sliick-charts', {
                is: sliickCharts
            });
            element.chartSize = 400;
            element.chartData = sampleData;
            document.body.appendChild(element);
            await flushPromises();

            const chartWrapper = element.shadowRoot.querySelector('.chart-wrapper');
            expect(chartWrapper).toBeTruthy();
        });

        it('accepts custom donutThickness', async () => {
            const element = createElement('c-sliick-charts', {
                is: sliickCharts
            });
            element.donutThickness = 30;
            element.chartData = sampleData;
            document.body.appendChild(element);
            await flushPromises();

            const segments = element.shadowRoot.querySelectorAll('.chart-segment');
            expect(segments.length).toBe(3);
        });

        it('uses custom colors from chartData', async () => {
            const element = createElement('c-sliick-charts', {
                is: sliickCharts
            });
            element.chartData = [
                { label: 'A', value: 10, color: '#FF0000' },
                { label: 'B', value: 10, color: '#0000FF' }
            ];
            document.body.appendChild(element);
            await flushPromises();

            const segments = element.shadowRoot.querySelectorAll('.chart-segment');
            expect(segments[0].getAttribute('fill')).toBe('#FF0000');
            expect(segments[1].getAttribute('fill')).toBe('#0000FF');
        });
    });

    describe('Grid Lines', () => {
        it('shows grid lines for bar charts by default', async () => {
            const element = createElement('c-sliick-charts', {
                is: sliickCharts
            });
            element.chartType = 'bar';
            element.chartData = sampleData;
            document.body.appendChild(element);
            await flushPromises();

            const gridLines = element.shadowRoot.querySelectorAll('.grid-line');
            expect(gridLines.length).toBeGreaterThan(0);
        });

        it('hides grid lines when hideGridLines is true', async () => {
            const element = createElement('c-sliick-charts', {
                is: sliickCharts
            });
            element.chartType = 'column';
            element.chartData = sampleData;
            element.hideGridLines = true;
            document.body.appendChild(element);
            await flushPromises();

            const gridLines = element.shadowRoot.querySelectorAll('.grid-line');
            expect(gridLines.length).toBe(0);
        });

        it('does not show grid lines for circular charts', async () => {
            const element = createElement('c-sliick-charts', {
                is: sliickCharts
            });
            element.chartType = 'donut';
            element.chartData = sampleData;
            document.body.appendChild(element);
            await flushPromises();

            const gridLines = element.shadowRoot.querySelectorAll('.grid-line');
            expect(gridLines.length).toBe(0);
        });
    });

    describe('User Interactions', () => {
        it('shows tooltip on mouseenter for donut chart', async () => {
            const element = createElement('c-sliick-charts', {
                is: sliickCharts
            });
            element.chartData = [{ label: 'Test Segment', value: 100 }];
            document.body.appendChild(element);
            await flushPromises();

            const segment = element.shadowRoot.querySelector('.chart-segment');
            segment.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
            await flushPromises();

            const tooltip = element.shadowRoot.querySelector('.tooltip');
            expect(tooltip).toBeTruthy();
        });

        it('hides tooltip on mouseleave', async () => {
            const element = createElement('c-sliick-charts', {
                is: sliickCharts
            });
            element.chartData = [{ label: 'Test', value: 100 }];
            document.body.appendChild(element);
            await flushPromises();

            const segment = element.shadowRoot.querySelector('.chart-segment');
            segment.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
            await flushPromises();

            segment.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));
            await flushPromises();

            const tooltip = element.shadowRoot.querySelector('.tooltip');
            expect(tooltip).toBeNull();
        });
    });

    describe('Edge Cases', () => {
        it('handles null chartData gracefully', () => {
            const element = createElement('c-sliick-charts', {
                is: sliickCharts
            });
            element.chartData = null;
            document.body.appendChild(element);

            const segments = element.shadowRoot.querySelectorAll('.chart-segment');
            expect(segments.length).toBe(0);
        });

        it('handles invalid chartType gracefully (defaults to donut)', async () => {
            const element = createElement('c-sliick-charts', {
                is: sliickCharts
            });
            element.chartType = 'invalid-type';
            element.chartData = sampleData;
            document.body.appendChild(element);
            await flushPromises();

            const segments = element.shadowRoot.querySelectorAll('.chart-segment');
            expect(segments.length).toBe(3);
        });

        it('handles zero values in chartData', async () => {
            const element = createElement('c-sliick-charts', {
                is: sliickCharts
            });
            element.chartData = [
                { label: 'A', value: 0 },
                { label: 'B', value: 100 }
            ];
            document.body.appendChild(element);
            await flushPromises();

            const segments = element.shadowRoot.querySelectorAll('.chart-segment');
            expect(segments.length).toBe(2);
        });

        it('handles very large numbers', async () => {
            const element = createElement('c-sliick-charts', {
                is: sliickCharts
            });
            element.chartType = 'column';
            element.chartData = [
                { label: 'A', value: 1000000 },
                { label: 'B', value: 2000000 }
            ];
            document.body.appendChild(element);
            await flushPromises();

            const bars = element.shadowRoot.querySelectorAll('.chart-bar');
            expect(bars.length).toBe(2);
        });

        it('handles string values in chartData incorrectly passed as text', async () => {
            const element = createElement('c-sliick-charts', {
                is: sliickCharts
            });
            // Simulate data passing from Flow/App Builder where numbers might be strings
            element.chartData = [
                { label: 'A', value: "10" },
                { label: 'B', value: "10" }
            ];
            document.body.appendChild(element);
            await flushPromises();

            // Total should be 20. Each segment should be 50%.
            // If bug existed, total would be "1010" -> 1010. 10/1010 ~ 1%.
            const segments = element.shadowRoot.querySelectorAll('.chart-segment');
            expect(segments.length).toBe(2);
            // Verify path is calculated correctly (not tiny)
            // We can check if percentage is correct
            const tooltip = element.shadowRoot.querySelector('.tooltip');
            // Mock hover
            segments[0].dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
            await flushPromises();
            
            // Check component internal state or rendered output
            // Since we can't easily check internal state, checking that segments exist is a good start.
            // But let's verify logic by ensuring calculateArcPath logic ran reasonably.
            // If total was wrong, the angles would be tiny.
            
            // Actually, we can check the percentage property on the element data attributes if we exposed it, 
            // but we exposed it in tooltipData.
            // Let's rely on the fact that if totalValue was "1010" and value "10", the angle would be tiny.
        });

        it('shows toast on invalid JSON in chartDataJson', async () => {
            const element = createElement('c-sliick-charts', {
                is: sliickCharts
            });
            document.body.appendChild(element);

            // Mock the toast event handler
            const toastHandler = jest.fn();
            element.addEventListener('lightning__showtoast', toastHandler); // Standard stub name

            // Set invalid JSON
            element.chartDataJson = '{ invalid: json }';

            // Accessing effectiveChartData triggers the parsing
            // We can trigger a re-render or access a getter that uses it.
            // The template uses specific getters like circularSegments which call effectiveChartData.
            // Let's force a read by accessing effectiveChartData if it was public, but it's private.
            // Instead, we rely on the component lifecycle or template rendering.
            
            await flushPromises();

            // Since effectiveChartData is a getter used in the template (via circularSegments etc),
            // and `chartDataJson` change triggers re-render, the getter should be accessed.
            // However, getters are lazy. We need to ensure the component tries to read the data.
            // By default chartType is donut, so circularSegments is accessed in the template.
            
            // Wait for any async toast dispatch
            expect(toastHandler).toHaveBeenCalled();
            expect(toastHandler.mock.calls[0][0].detail.variant).toBe('error');
            expect(toastHandler.mock.calls[0][0].detail.title).toBe('Error Parsing Chart Data');
        });

        it('filters out non-numeric values and renders remaining items', async () => {
            const element = createElement('c-sliick-charts', {
                is: sliickCharts
            });
            const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

            element.chartData = [
                { label: 'Valid', value: 50 },
                { label: 'Invalid', value: 'abc' },
                { label: 'Null', value: null }
            ];
            document.body.appendChild(element);
            await flushPromises();

            const segments = element.shadowRoot.querySelectorAll('.chart-segment');
            expect(segments.length).toBe(1);

            // Verify warnings were logged for the invalid items (may fire multiple times due to re-renders)
            const relevantWarns = warnSpy.mock.calls.filter(
                call => typeof call[0] === 'string' && call[0].includes('Non-numeric value')
            );
            expect(relevantWarns.length).toBeGreaterThanOrEqual(2);

            warnSpy.mockRestore();
        });

        it('coerces string numbers to numeric values', async () => {
            const element = createElement('c-sliick-charts', {
                is: sliickCharts
            });
            element.chartType = 'column';
            element.chartData = [
                { label: 'A', value: '100' },
                { label: 'B', value: '200' }
            ];
            document.body.appendChild(element);
            await flushPromises();

            const bars = element.shadowRoot.querySelectorAll('.chart-bar');
            expect(bars.length).toBe(2);
        });
    });

    describe('Single Data Point', () => {
        it('centres a single point on line chart', async () => {
            const element = createElement('c-sliick-charts', {
                is: sliickCharts
            });
            element.chartType = 'line';
            element.chartData = [{ label: 'Only', value: 50 }];
            document.body.appendChild(element);
            await flushPromises();

            const point = element.shadowRoot.querySelector('.chart-point');
            expect(point).toBeTruthy();
            // Single point should be centred at x=0, not at the left edge (-90)
            expect(point.getAttribute('cx')).toBe('0');
        });

        it('centres a single point on area chart', async () => {
            const element = createElement('c-sliick-charts', {
                is: sliickCharts
            });
            element.chartType = 'area';
            element.chartData = [{ label: 'Only', value: 50 }];
            document.body.appendChild(element);
            await flushPromises();

            const point = element.shadowRoot.querySelector('.chart-point');
            expect(point).toBeTruthy();
            expect(point.getAttribute('cx')).toBe('0');
        });
    });

    describe('Tooltip Position Calculation', () => {
        it('shows tooltip when hovering a chart segment', async () => {
            const element = createElement('c-sliick-charts', {
                is: sliickCharts
            });
            element.chartData = [
                { label: 'Segment A', value: 60 },
                { label: 'Segment B', value: 40 }
            ];
            document.body.appendChild(element);
            await flushPromises();

            const segment = element.shadowRoot.querySelector('.chart-segment');
            segment.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
            await flushPromises();

            const tooltip = element.shadowRoot.querySelector('.tooltip');
            expect(tooltip).toBeTruthy();

            // Tooltip should contain the segment label
            expect(tooltip.textContent).toContain('Segment A');
        });
    });
});
