import * as d3 from 'd3';
export { d3 };

interface BarChartData {
    label: string;
    value: number;
}
declare class BarChart {
    private _container;
    private _data;
    private _width;
    private _height;
    constructor(containerId: string, data: BarChartData[]);
    render(): void;
}

export { BarChart };
