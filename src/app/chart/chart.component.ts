import { Component, OnChanges, ViewChild, ElementRef, Input, ViewEncapsulation } from '@angular/core';
import { DataType, LineData, DataModel } from '../service/datatype';
import * as d3 from 'd3';

@Component({
  selector: 'app-chart',
  encapsulation: ViewEncapsulation.None,
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.scss']
})
export class ChartComponent implements OnChanges {
  @ViewChild('chart')
  private chartContainer: ElementRef;

  @Input()
  // data: DataModel[];
  data: LineData[];
  color: any;
  td_width: number;

  margin = {top: 20, right: 20, bottom: 30, left: 40};

  constructor() { }

  ngOnChanges() {
    if (!this.data) { return; }

    console.log(this.data);
    this.createChart();
  }

  private createChart(): void {
    if (!this.data) {
      return;
    }
    d3.select('svg').remove();

    const element = this.chartContainer.nativeElement;

    const contentWidth = element.offsetWidth - this.margin.left - this.margin.right;
    this.td_width = contentWidth / this.data[0].values.length;
    const contentHeight = element.offsetHeight - this.margin.top - this.margin.bottom;

    const width = 500;
    const height = 300;
    const margin = 50;
    const duration = 250;

    const lineOpacity = '0.25';
    const lineOpacityHover = '0.85';
    const otherLinesOpacityHover = '0.1';
    const lineStroke = '1.5px';
    const lineStrokeHover = '2.5px';

    const circleOpacity = '0.85';
    const circleOpacityOnLineHover = '0.25';
    const circleRadius = 3;
    const circleRadiusHover = 6;


    /* Format Data */
    const parseDate = d3.timeParse('%Y');
    this.data.forEach(function (d) {
      d.values.forEach(function (d1) {
        d1.date = d1.date; // parseDate(d1.date);
        d1.price = +d1.price;
      });
    });

    /* Scale */
    const xScale = d3.scaleBand()
      .domain(this.data[0].values.map(d => d.date))
      .range([0, contentWidth])
      .padding(1);
      // .range([0, width - margin]);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(this.data, function (d) {
        return d3.max(d.values, (di) => di.price);
      })])
      .range([height - margin, 0]);
      // .range([contentHeight, 0]);

    const color = d3.scaleOrdinal(d3.schemeCategory10);
    this.color = [];
    for (let index = 0; index < this.data.length; index++) {
      this.color.push(color(index.toString()));
    }

    /* Add SVG */
    const svg = d3.select('#chart').append('svg')
      .attr('width', (element.offsetWidth) + 'px')
      .attr('height', (height + margin) + 'px')
      .append('g')
      .attr('transform', `translate(${this.margin.left + this.margin.right}, ${this.margin.top + this.margin.bottom})`);

    // const svg = d3.select('#chart').append('svg')
    //   .attr('width', element.offsetWidth)
    //   .attr('height', element.offsetHeight)
    //   .append('g')
    //   .attr('transform', `translate(${margin}, ${margin})`);

    /* Add line into SVG */
    const line = d3.line()
      .x((d: any) => xScale(d.date))
      .y((d: any) => yScale(d.price));

    const lines = svg.append('g')
      .attr('class', 'lines');

    lines.selectAll('.line-group')
      .data(this.data).enter()
      .append('g')
      .attr('class', 'line-group')
      .on('mouseover', (d, i) => {
        svg.append('text')
          .attr('class', 'title-text')
          .style('fill', color(i.toString()))
          .text(d.name)
          .attr('text-anchor', 'middle')
          // .attr('x', (width - margin) / 2)
          .attr('x', contentWidth / 2)
          .attr('y', 5);
      })
      .on('mouseout',  (d) => {
        svg.select('.title-text').remove();
      })
      .append('path')
      .attr('class', 'line')
      .attr('d', (d: any) => line(d.values))
      .style('stroke', (d, i) => color(i.toString()))
      .style('opacity', lineOpacity)
      .on('mouseover', function (d) {
        d3.selectAll('.line')
          .style('opacity', otherLinesOpacityHover);
        d3.selectAll('.circle')
          .style('opacity', circleOpacityOnLineHover);
        d3.select(this)
          .style('opacity', lineOpacityHover)
          .style('stroke-width', lineStrokeHover)
          .style('cursor', 'pointer');
      })
      .on('mouseout', function (d) {
        d3.selectAll('.line')
          .style('opacity', lineOpacity);
        d3.selectAll('.circle')
          .style('opacity', circleOpacity);
        d3.select(this)
          .style('stroke-width', lineStroke)
          .style('cursor', 'none');
      });


    /* Add circles in the line */
    lines.selectAll('circle-group')
      .data(this.data).enter()
      .append('g')
      .style('fill', (d, i: any) => color(i))
      .selectAll('circle')
      .data(d => d.values).enter()
      .append('g')
      .attr('class', 'circle')
      .on('mouseover', function (d1) {
        d3.select(this)
          .style('cursor', 'pointer')
          .append('text')
          .attr('class', 'text')
          .text(`${d1.price}`)
          .attr('x', (d: any) => xScale(d.date) + 5)
          .attr('y', (d: any) => yScale(d.price) - 10);
      })
      .on('mouseout', function (d) {
        d3.select(this)
          .style('cursor', 'none')
          .transition()
          .duration(duration)
          .selectAll('.text').remove();
      })
      .append('circle')
      .attr('cx', d => xScale(d.date))
      .attr('cy', d => yScale(d.price))
      .attr('r', circleRadius)
      .style('opacity', circleOpacity)
      .on('mouseover', function (d) {
        d3.select(this)
          .transition()
          .duration(duration)
          .attr('r', circleRadiusHover);
      })
      .on('mouseout', function (d) {
        d3.select(this)
          .transition()
          .duration(duration)
          .attr('r', circleRadius);
      });


    /* Add Axis into SVG */
    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale);

    svg.append('g')
      .attr('class', 'x axis')
      .attr('transform', `translate(0, ${height - margin})`)
      // .attr('transform', `translate(0, ${contentHeight})`)
      .call(xAxis);

    svg.append('g')
      .attr('class', 'y axis')
      .call(yAxis)
      .append('text')
      .attr('y', 15)
      .attr('transform', 'rotate(-90)')
      .attr('fill', '#000')
      .text('Total values');
  }

  onResize() {
    this.createChart();
  }


}
