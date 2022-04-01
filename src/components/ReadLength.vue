<script setup>
import * as d3 from 'd3'
import chartUtils from '../utils/chart'
import numberUtils from '../utils/number'
import tooltipUtils from '../utils/tooltip'
import ChartSaver from './ChartSaver.vue'
import FileReader from './FileReader.vue'
</script>

<template>
    <section class="entry">
        <h2 class="title title--2">Read length</h2>
        <FileReader id="fileReadLength" @load="parseFile" />
        <div>
            <div :id="idGraph" :ref="idGraph" class="entry__graph"></div>
            <footer v-if="d3Data" class="entry__footer">
                <div class="data">
                    <label class="data__label">Max</label>
                    <output class="data__value">{{max}}</output>
                </div>
                <div class="data">
                    <label class="data__label">Min</label>
                    <output class="data__value">{{min}}</output>
                </div>
                <div class="data">
                    <label class="data__label">Median</label>
                    <output class="data__value">{{median}}</output>
                </div>
                <ChartSaver :id-graph="idGraph" />
            </footer>
        </div>
    </section>
</template>

<script>
export default {
    components: {
        ChartSaver,
        FileReader,
    },
    data() {
        return {
            idGraph: 'd3GraphReadLength',
            max: 0,
            min: 0,
            median: 0,
            d3Data: undefined,
            threshold: 0,
        }
    },
    computed: {
        filteredD3Data() {
            return this.d3Data?.filter((d) => d.value >= this.threshold)
        },
        percentageFilteredD3Data() {
            const ratio = this.d3Data && this.filteredD3Data ? this.filteredD3Data.length / this.d3Data.length : 1
            const percentage = ratio * 100
            return numberUtils.frFloat(numberUtils.decimal(percentage))
        }
    },
    watch: {
        threshold(value) {
            this.drawGraph()
        },
    },
    methods: {
        parseFile(data) {
            this.d3Data = this.parseTsv(data)
            this.d3Data.sort(d3.ascending)

            this.drawGraph()
        },
        parseTsv(data) {
            const parsedData = d3.tsvParse(data)
            return parsedData.map((d) => Number.parseInt(d.size))
        },
        drawGraph() {
            const { svg, width, height, margin } = chartUtils.setSvg(this.idGraph, this.$refs[this.idGraph].getBoundingClientRect().width)

            const q1 = d3.quantile(this.d3Data, .25)
            const median = d3.quantile(this.d3Data, .5)
            const q3 = d3.quantile(this.d3Data, .75)
            const interQuantileRange = q3 - q1
            const gaussianishScale = 1.5
            const min = q3 - gaussianishScale * interQuantileRange
            const max = q1 + gaussianishScale * interQuantileRange
            const yMin = Math.min(this.d3Data[0], min)
            const yMax = Math.max(this.d3Data[this.d3Data.length - 1], max)

            this.min = min
            this.max = max
            this.median = median

            const yScale = d3.scaleLinear().domain([yMin, yMax]).range([height, 0])
            const yAxis = d3.axisLeft(yScale)
            const yLegend = svg.call(yAxis)

            const center = width / 2
            const boxWidth = 100

            const verticalLine = svg.append('line')
                .attr('x1', center)
                .attr('x2', center)
                .attr('y1', yScale(min))
                .attr('y2', yScale(max))
                .classed('boxplot__line', true)

            const tooltipBox = tooltipUtils.set(this.idGraph)
            const box = svg.append('rect')
                .attr('x', center - (boxWidth / 2))
                .attr('y', yScale(q3))
                .attr('height', yScale(q1) - yScale(q3))
                .attr('width', boxWidth)
                .classed('boxplot__box', true)
                .on('mouseover', function (d) {
                    tooltipBox.style('opacity', 1)
                })
                .on('mousemove', function(event) {
                    tooltipUtils.setCoordinates(event, tooltipBox)
                    tooltipBox.html(`
                        <div>Q1: ${q1}</div>
                        <div>Median: ${median}</div>
                        <div>Q3: ${q3}</div>
                    `)
                })
                .on('mouseleave', function (d) {
                    tooltipBox.style('opacity', 0)
                })

            const lines = svg
            .selectAll()
            .data([min, median, max])
            .enter()
            .append('line')
                .attr('x1', center - (boxWidth / 2))
                .attr('x2', center + (boxWidth / 2))
                .attr('y1', (d) => yScale(d))
                .attr('y2', (d) => yScale(d))
                .classed('boxplot__line', true)

            const tooltipCircle = tooltipUtils.set(this.idGraph)
            const circles = svg.selectAll()
            .data(this.d3Data.filter((d) => d > max || d < min))
            .enter()
            .append('circle')
                .attr('data-value', (d) => d)
                .attr('cx', (d) => center)
                .attr('cy', (d) => yScale(d))
                .attr('r', '4')
                .classed('lollipop__sugar', true)
                .on('mouseover', function (d) {
                    tooltipCircle.style('opacity', 1)
                })
                .on('mousemove', function(event) {
                    tooltipUtils.setCoordinates(event, tooltipCircle)
                    const value = Number.parseInt(event.target.dataset.value)
                    tooltipCircle.html(`
                        <div>Occurences: ${value}</div>
                    `)
                })
                .on('mouseleave', function (d) {
                    tooltipCircle.style('opacity', 0)
                })
        },
    },
}
</script>
