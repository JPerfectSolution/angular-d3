import { Component, OnInit, ViewEncapsulation, ViewChild, ElementRef, Input, OnChanges } from '@angular/core';
import * as d3 from 'd3';
import { StackedData, DataModel, LineData } from '../service/datatype';


@Component({
  selector: 'app-stacked-chart',
  encapsulation: ViewEncapsulation.None,
  templateUrl: './stacked-chart.component.html',
  styleUrls: ['./stacked-chart.component.scss']
})
export class StackedChartComponent implements OnChanges {
  @ViewChild('stackedchart')
  private chartContainer: ElementRef;

  @Input()
  data: StackedData[];


  margin = { top: 20, right: 20, bottom: 30, left: 40 };

  constructor() { }

  ngOnChanges() {
    console.log(this.data);
    if (!this.data) { return; }
    this.createChart();
  }

  private createChart(): void {
    if (!this.data) {
      return;
    }

    const element = this.chartContainer.nativeElement;

    d3.select('svg').remove();

    const marginStackChart = { top: 20, right: 20, bottom: 50, left: 40 };
    const widthStackChart = 800 - marginStackChart.left - marginStackChart.right;
    const heightStackChart = 600 - marginStackChart.top - marginStackChart.bottom;

    const xStackChart = d3.scaleBand()
      .range([0, widthStackChart])
      .padding(0.1);
    const yStackChart = d3.scaleLinear()
      .range([heightStackChart, 0]);


    const colorStackChart = d3.scaleOrdinal(['#8faadc', '#bdd7ee']);


    const canvasStackChart = d3.select('#stackedchart').append('svg')
      .attr('width', widthStackChart + marginStackChart.left + marginStackChart.right)
      .attr('height', heightStackChart + marginStackChart.top + marginStackChart.bottom)
      .append('g')
      .attr('transform', 'translate(' + marginStackChart.left + ',' + marginStackChart.top + ')');
    colorStackChart.domain(d3.keys(this.data[0]).filter(function (key) { return key !== 'year'; }));

    this.data.forEach(function (d: any) {
      let y0 = 0;
      d.ages = colorStackChart.domain().map(function (name) { return { name: name, y0: y0, y1: y0 += +d[name] }; });
      d.total = d.ages[d.ages.length - 1].y1;
    });

    // data.sort(function (a, b) { return b.total - a.total; });

    xStackChart.domain(this.data.map(function (d: any) { return d.year; }));
    yStackChart.domain([0, d3.max(this.data, function (d: any) { return d.total; }) + 200]);

    canvasStackChart.append('g')
      .attr('class', 'x axis')
      .attr('transform', 'translate(0,' + heightStackChart + ')')
      .call(d3.axisBottom(xStackChart))
      .selectAll('.tick text')
      .call(this.wrap, xStackChart.bandwidth());


    canvasStackChart.append('g')
      .attr('class', 'y axis')
      .call(d3.axisLeft(yStackChart))
      .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', 6)
      .attr('dy', '.71em')
      .style('text-anchor', 'end')
      .text('No Of Buildings');

    canvasStackChart.append('text')
      .attr('class', 'title')
      .attr('x', widthStackChart / 2)
      .attr('y', 0)
      .attr('text-anchor', 'middle')
      .text('Impatti di Stage Assignment');

    const state = canvasStackChart.selectAll('.year')
      .data(this.data)
      .enter().append('g')
      .attr('class', 'g')
      .attr('transform', function (d: any) { return 'translate(' + xStackChart(d.year) + ',0)'; });

    state.selectAll('rect')
      .data(function (d: any) { return d.ages; })
      .enter().append('rect')
      .attr('width', xStackChart.bandwidth())
      .attr('y', function (d: any) { return yStackChart(d.y1); })
      .attr('height', function (d: any) { return yStackChart(d.y0) - yStackChart(d.y1); })
      .style('fill', function (d: any) { return colorStackChart(d.name); });

    state.selectAll('text')
      .data(function (d: any) { return d.ages; })
      .enter().append('text')
      .attr('x', xStackChart.bandwidth() / 2)
      .attr('y', function (d: any) { return (yStackChart(d.y1) + yStackChart(d.y0)) / 2; })
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'central')
      .text((d: any) => {
        console.log(d);
        return (d.name === 'data1' ? d.y1 : d.y1 - d.y0);
      });


    // const legend = canvasStackChart.selectAll('.legend')
    //   .data(colorStackChart.domain().slice().reverse())
    //   .enter().append('g')
    //   .attr('class', 'legend')
    //   .attr('transform', function (d, i) { return 'translate(-' + i * 50 + ', 10)'; });

    // legend.append('rect')
    //   .attr('x', 0)
    //   .attr('width', 18)
    //   .attr('height', 18)
    //   .style('fill', colorStackChart);

    // legend.append('text')
    //   .attr('x', 40)
    //   .attr('y', 9)
    //   .attr('dy', '.35em')
    //   .style('text-anchor', 'middle')
    //   .text(function (d) { return d; });
  }

  wrap(text, w) {
    text.each(function () {
      const txt = d3.select(this),
        words = txt.text().split(/\s+/).reverse();
      let word,
        line = [],
        lineNumber = 0;
      const lineHeight = 1.1, // ems
        yy = txt.attr('y'),
        dy = parseFloat(txt.attr('dy'));
      let tspan = txt.text(null).append('tspan').attr('x', 0).attr('y', yy).attr('dy', dy + 'em')
      while (word = words.pop()) {
        line.push(word);
        tspan.text(line.join(' '));
        if (tspan.node().getComputedTextLength() > w) {
          line.pop();
          tspan.text(line.join(' '));
          line = [word];
          tspan = txt.append('tspan').attr('x', 0).attr('y', yy).attr('dy', `${++lineNumber * lineHeight + dy}em`).text(word);
        }
      }
    });
  }

  onResize() {
    this.createChart();
  }

}
