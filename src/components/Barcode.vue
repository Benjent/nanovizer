<script setup>
import * as d3 from 'd3'
import chartUtils from '../utils/chart'
import mathUtils from '../utils/math'
import tooltipUtils from '../utils/tooltip'
import resizeMixin from '../mixins/resize'
import ChartSaver from './ChartSaver.vue'
</script>

<template>
    <section class="entry">
        <h2 class="title title--2" id="barcode">Barcode</h2>
        <div>
            <div :id="idGraph" :ref="idGraph" class="entry__graph"></div>
            <footer v-if="d3Data" class="entry__footer">
                <ChartSaver :id-graph="idGraph" />
            </footer>
        </div>
    </section>
</template>

<script>
export default {
    mixins: [resizeMixin],
    components: {
        ChartSaver,
    },
    props: {
        data: {
            type: Array,
        },
    },
    data() {
        return {
            idGraph: 'd3GraphBarcode',
            d3Data: undefined,
        }
    },
    watch: {
        data(value) {
            if (value) {
                const parsedData = this.parseData(value)
                this.d3Data = mathUtils.sort(parsedData, 'count', 'DESC')
                this.drawGraph()
            }
        },
    },
    methods: {
        parseData(data) {
            return data.map((d) => {
                const [ barcode, count ] = Object.entries(d)[0]
                const blocks = barcode.split('_')

                return {
                    barcode,
                    blocks: blocks.map((b) => Number.parseInt(b)),
                    count,
                }
            })
        },
        drawGraph() {
            if (!this.$refs[this.idGraph] || !this.d3Data) { return }
            const approximateBarHeight = 10
            const chartHeight = approximateBarHeight * this.d3Data.length
            const { svg, width, height, margin } = chartUtils.setSvg(this.idGraph, this.$refs[this.idGraph].getBoundingClientRect().width, { height: chartHeight, margin: { left: 180 } })
            const xMin = d3.min(this.d3Data.map((d) => d.blocks[0]))
            const xMax = d3.max(this.d3Data.map((d) => d.blocks[d.blocks.length - 1]))
            const xScale = d3.scaleLinear().range([0, width]).domain([xMin, xMax])
            const xAxis = d3.axisBottom(xScale)
            const xLegend = svg.append('g')
                .attr('transform', 'translate(0,' + height + ')')
                .call(xAxis)
                .selectAll('text')
                    .attr('transform', 'translate(-10,0)rotate(-45)')
                    .style('text-anchor', 'end')

            const yScale = d3.scaleBand()
                .domain(this.d3Data.map((d) => d.barcode))
                .range([height, 0])
                .padding(0.1)
            const yAxis = d3.axisLeft(yScale)
            const yLegend = svg.append('g').call(yAxis)

            const entries = svg.selectAll()
                .data(this.d3Data)
                .enter()

            entries.each((d, i) => {
                d.blocks.forEach(() => {
                    if (i < d.blocks.length - 1) {
                        entries.append('rect')
                            .attr('data-start', (d) => d.blocks[i])
                            .attr('data-end', (d) => d.blocks[i + 1])
                            .attr('x', (d) => xScale(d.blocks[i]))
                            .attr('y', (d) => i % 2 === 0 ? yScale(d.barcode) : yScale(d.barcode) + yScale.bandwidth() / 2)
                            .attr('height', () => i % 2 === 0 ? yScale.bandwidth() : 1)
                            .attr('width', (d) => xScale(d.blocks[i + 1] - d.blocks[i]))
                            .classed('rectangle', true)
                    }
                })
            })
            
            const tooltip = tooltipUtils.set(this.idGraph)
            const blocks = svg.selectAll('.rectangle')
            blocks
            .on('mouseover', function (event) {
                const opacity = 0.1
                blocks.style('opacity', opacity)
                d3.select(this).style('opacity', 1)

                tooltip.style('opacity', 1)
            })
            .on('mousemove', function (event) {
                tooltipUtils.setCoordinates(event, tooltip)
                const start = Number.parseInt(event.target.dataset.start)
                const end = Number.parseInt(event.target.dataset.end)
                tooltip
                .html(`
                    <div>Start: ${start}</div>
                    <div>End: ${end}</div>
                `)
            })
            .on('mouseleave', function () {
                tooltipUtils.reset(tooltip)
                blocks.style('opacity', 1)
            })

        },
    },
}
</script>
