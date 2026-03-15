import { LightningElement } from 'lwc';

export default class SliickChartsExample extends LightningElement {
    get barChartData() {
        return [
            { label: 'Jan', value: 450, color: '#5EB4FF' },
            { label: 'Feb', value: 380, color: '#3AE867' },
            { label: 'Mar', value: 520, color: '#FFC838' },
            { label: 'Apr', value: 410, color: '#FF7346' },
            { label: 'May', value: 480, color: '#E287F5' },
            { label: 'Jun', value: 550, color: '#47C9F2' },
            { label: 'Jul', value: 620, color: '#FF5D5D' },
            { label: 'Aug', value: 580, color: '#7DD387' },
            { label: 'Sep', value: 510, color: '#5EB4FF' },
            { label: 'Oct', value: 600, color: '#3AE867' },
            { label: 'Nov', value: 650, color: '#FFC838' },
            { label: 'Dec', value: 2000, color: '#FF7346' }
        ];
    }
}
