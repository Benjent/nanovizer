<script setup>
import * as d3 from 'd3'
import axios from '../libs/axios'
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
        <div class="data">
            <label class="data__label">FASTQ file name</label>
            <input class="input data__value" v-model="fastqFile" min="0" />
        </div>
        <p class="helper l-barcode__helper">
            Provide the name of the FASTQ file then click on a barcode to export all its corresponding sequences as a new FASTQ file saved in the result folder
        </p>
        <Loader v-if="isLoadingBarcode" />
        <p v-if="isError" class="l-barcode__error">
            An error occured during the process. Either the file is corrupted, misspelled or missing ; or we came across data that we couldn't parse.
        </p>
        <div>
            <div :id="idGraph" :ref="idGraph" class="entry__graph"></div>
            <div class="l-barcode__sticky-cta">
                <Loader v-if="isLoading" />
                <button v-else class="button button--secondary" :disabled="isLoading" @click="collapseBarcodes">
                    <Icon :icon="revealButtonIcon" />&nbsp;{{revealButtonText}}
                </button>
            </div>
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
        genomeSize: {
            type: Number,
        },
    },
    data() {
        return {
            fastqFile: '',
            idGraph: 'd3GraphBarcode',
            isError: false,
            isLoading: false,
            isLoadingBarcode: false,
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
        fastqFile(newVal) {
            this.isError = false
            const barcodes = document.querySelector('.barcode-axis').querySelectorAll('text')
            if (newVal && newVal.length !== 0) {
                barcodes.forEach((n) => {
                    if (!n.classList.contains('link')) {
                        n.classList.add('link')
                    }
                })
            } else {
                barcodes.forEach((n) => {
                    if (n.classList.contains('link')) {
                        n.classList.remove('link')
                    }
                })
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
        saveBarcodeDetails(barcode) {
            this.isLoadingBarcode = true

            axios.post('/barcode', { barcode })
            .then((response) => {})
            .catch((error) => {
                console.error(error)
                this.isError = true
            })
            .finally(() => {
                this.isLoadingBarcode = false
            })
        },
        drawGraph() {
            const self = this

            if (!this.$refs[this.idGraph] || !this.d3Data) { return }
            const approximateBarHeight = 10
            const chartHeight = this.isShownBarcodes ? approximateBarHeight * this.d3Data.length : 160
            const filteredData = this.isShownBarcodes ? this.d3Data : this.d3Data.slice(0, this.minimumShownBarcodes)
            const dataMax = d3.max(filteredData.map((d) => d.blocks[d.blocks.length - 1]))

            const xMin = d3.min(filteredData.map((d) => d.blocks[0]))
            const xMax = chartUtils.getXMax(this.genomeSize, dataMax)

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
            const yLegend = svg.append('g').classed('barcode-axis', true).call(yAxis)

            const barcodes = svg.select('.barcode-axis')
                .selectAll('.tick text')
                // .classed('link', true)
                .attr('data-barcode', (d) => d)
                .on('click', function (event) {
                    if (event.target.classList.contains('link')) {
                        d3.select(this).classed('link', false)
                        self.saveBarcodeDetails(event.target.dataset.barcode)
                    }
                })

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
                tooltip
                .html(`
                    <div>Start: ${start}</div>
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
    &__helper {
        margin-bottom: 20px;
    }

    &__error {
        margin-top: 20px;
        color: var(--alert);
    }

    &__sticky-cta {
        display: flex;
        justify-content: center;
        position: sticky;
        bottom: 20px;
        margin: auto;
        margin-bottom: 20px;
    }
}
</style>
