<script setup>
import * as d3 from 'd3'
import chartUtils from '../utils/chart'
import mathUtils from '../utils/math'
import tooltipUtils from '../utils/tooltip'
import resizeMixin from '../mixins/resize'
import ChartSaver from './ChartSaver.vue'
import Icon from './Icon.vue'
import Loader from './Loader.vue'
</script>

<template>
    <section class="entry l-barcode">
        <h2 class="title title--2" id="barcode">Barcode</h2>
        <div>
            <div :id="idGraph" :ref="idGraph" class="entry__graph"></div>
            <button class="button l-barcode__sticky-cta" :disabled="isLoading" @click="collapseBarcodes">
                <Loader v-if="isLoading" />
                <Icon v-else :icon="revealButtonIcon" />&nbsp;{{revealButtonText}}
            </button>
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
        Icon,
        Loader,
    },
    props: {
        data: {
            type: Array,
        },
        size: {
            type: Number,
        },
    },
    data() {
        return {
            idGraph: 'd3GraphBarcode',
            isLoading: false,
            isShownBarcodes: true,
            d3Data: undefined,
            minimumShownBarcodes: 10
        }
    },
    computed: {
        filteredOutBarcodes() {
            return this.d3Data.length - this.minimumShownBarcodes
        },
        revealButtonIcon() {
            return this.isShownBarcodes ? 'unfold_less' : `unfold_more`
        },
        revealButtonText() {
            return this.isShownBarcodes ? 'Collapse' : `Reveal remaining ${this.filteredOutBarcodes} barcodes`
        },
    },
    watch: {
        data(value) {
            if (value) {
                const parsedData = this.parseData(value)
                this.d3Data = mathUtils.sort(parsedData, 'count', 'DESC')
                this.drawGraph()
            }
        },
        isShownBarcodes(value) {
            if (value) {
                this.isLoading = true
                setTimeout(() => {
                    // Force loading rendering before drawing charts
                    this.drawGraph()
                    this.isLoading = false
                }, 1)
            } else {
                this.drawGraph()
            }
        },
    },
    methods: {
        collapseBarcodes() {
            this.isShownBarcodes = !this.isShownBarcodes
        },
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
            const chartHeight = this.isShownBarcodes ? approximateBarHeight * this.d3Data.length : 160
            const filteredData = this.isShownBarcodes ? this.d3Data : this.d3Data.slice(0, this.minimumShownBarcodes)
            const dataMax = d3.max(filteredData.map((d) => d.blocks[d.blocks.length - 1]))

            const xMin = d3.min(filteredData.map((d) => d.blocks[0]))
            const xMax = this.size ? Math.max(this.size, dataMax) : dataMax

            if (!this.isShownBarcodes) {
                filteredData.push({ barcode: `${this.filteredOutBarcodes} more to show...`, blocks: [1, xMax], count: -1 })
            }

            const { svg, width, height, margin } = chartUtils.setSvg(this.idGraph, this.$refs[this.idGraph].getBoundingClientRect().width, { height: chartHeight, margin: { left: 180, right: 100 } })
            const xScale = d3.scaleLinear().range([0, width]).domain([xMin, xMax])
            const xAxis = d3.axisBottom(xScale)
            const xLegend = svg.append('g')
                .attr('transform', 'translate(0,' + height + ')')
                .call(xAxis)
                .selectAll('text')
                    .attr('transform', 'translate(-10,0)rotate(-45)')
                    .style('text-anchor', 'end')

            const yScale = d3.scaleBand()
                .domain(filteredData.map((d) => d.barcode))
                .range([0, height])
                .padding(0.1)
            const yAxis = d3.axisLeft(yScale)
            const yLegend = svg.append('g').call(yAxis)

            const yScaleRight = d3.scaleBand()
                .domain(filteredData)
                .range([0, height])
                .padding(0.1)
            const yAxisRight = d3.axisRight(yScaleRight).tickFormat((d) => d.count > 0 ? d.count : '')
            const yLegendRight = svg.append('g').attr('transform', `translate(${width}, 0)`).call(yAxisRight)

            const entries = svg.selectAll()
                .data(filteredData)
                .enter()

            entries.each((d, i) => {
                d.blocks.forEach(() => {
                    if (i < d.blocks.length - 1 && d.count > 0) { // Strangely, rect is still drawn despite d.count > 0 condition
                        entries.append('rect')
                            .attr('data-start', (d) => d.blocks[i])
                            .attr('data-end', (d) => d.blocks[i + 1])
                            .attr('data-count', (d) => d.count)
                            .attr('x', (d) => xScale(d.blocks[i]))
                            .attr('y', (d) => i % 2 === 0 ? yScale(d.barcode) : yScale(d.barcode) + yScale.bandwidth() / 2)
                            .attr('height', () => i % 2 === 0 ? yScale.bandwidth() : 0.6)
                            .attr('width', (d) => xScale(d.blocks[i + 1] - d.blocks[i]))
                            .classed('rectangle', true)
                            .style('display', (d) => d.count > 0 ? 'initial' : 'none') // Hide rect since d.count > 0 condition is not applied
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

<style lang="scss">
.l-barcode {
    &__sticky-cta {
        position: sticky;
        bottom: 20px;
        margin: auto;
        margin-bottom: 20px;
    }
}
</style>
