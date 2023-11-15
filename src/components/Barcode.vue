<template>
    <section class="entry l-barcode">
        <h2 class="title title--2" id="barcode">Barcode</h2>
        <Failure v-if="!rawData">
            Missing data. Chart could not be drawn.
        </Failure>
        <template v-else>
            <template v-if="isFastqEnabled">
                <div class="data">
                    <label class="data__label">FASTQ file name</label>
                    <input class="input data__value" v-model="fastqFile" min="0" />
                </div>
                <p class="helper l-barcode__helper">
                    Provide the name of the FASTQ file then click on a barcode to export all its corresponding sequences as a new FASTQ file saved in the result folder
                </p>
            </template>
            <Loader v-if="isLoadingBarcode" />
            <p v-if="isError" class="l-barcode__error">
                An error occured during the process. Either the file is corrupted, misspelled or missing ; or we came across data that we couldn't parse.
            </p>
            <p class="l-barcode__alert l-barcode__helper helper"><Icon icon="info" />&nbsp;Please be aware that in order to have a better visual representation of reads, barcode ends are arbitrarily set in a range from 1 to the genome size.</p>
            <div>
                <div :id="idGraph" :ref="idGraph" class="entry__graph entry__graph--big"></div>
                <div class="l-barcode__sticky-cta">
                    <Loader v-if="isLoading" />
                    <template v-else>
                        <button  class="button button--secondary" :disabled="isLoading" @click="moreBarcodes">
                            <Icon icon="playlist_add" />&nbsp;Reveal 10 more barcodes
                        </button>
                        <button  class="button button--secondary" :disabled="isLoading" @click="lessBarcodes">
                            <Icon icon="remove" />&nbsp;Hide last barcode
                        </button>
                    </template>
                </div>
                <footer v-if="d3Data" class="entry__footer">
                    <div class="data">
                        <label class="data__label">Displayed data percentage</label>
                        <output class="data__value">{{percentageFilteredD3Data}}%</output>
                    </div>
                    <ChartSaver :id-graph="idGraph" />
                </footer>
            </div>
        </template>
    </section>
</template>

<script lang="js">
import * as d3 from 'd3'
import { mapState } from 'pinia'
import { useMainStore } from '../stores/main'
import axios from '../libs/axios'
import chartUtils from '../utils/chart'
import mathUtils from '../utils/math'
import numberUtils from '../utils/number'
import tooltipUtils from '../utils/tooltip'
import resizeMixin from '../mixins/resize'
import ChartSaver from './ChartSaver.vue'
import Failure from './Failure.vue'
import Icon from './Icon.vue'
import Loader from './Loader.vue'

export default {
    mixins: [resizeMixin],
    components: {
        ChartSaver,
        Failure,
        Icon,
        Loader,
    },
    data() {
        return {
            fastqFile: '',
            idGraph: 'd3GraphBarcode',
            isError: false,
            isLoading: false,
            isLoadingBarcode: false,
            d3Data: undefined,
            nbShownBarcodes: 10,
            isFastqEnabled: false,
        }
    },
    computed: {
        ...mapState(useMainStore, ['genomeSize', 'nanoVizerData']),
        filteredD3Data() {
            return this.d3Data?.slice(0, this.nbShownBarcodes)
        },
        percentageFilteredD3Data() {
            const ratio = this.d3Data && this.filteredD3Data ? this.filteredD3Data.length / this.d3Data.length : 1
            const percentage = ratio * 100
            return numberUtils.frFloat(numberUtils.decimal(percentage))
        },
        rawData() {
            return this.nanoVizerData.barcode_count
        },
    },
    watch: {
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
        nbShownBarcodes(value) {
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
    mounted() {
        if (!this.rawData) return
        const parsedData = this.parseData(this.rawData)
        this.d3Data = mathUtils.sort(parsedData, 'count', 'DESC')
        this.drawGraph()
    },
    methods: {
        moreBarcodes() {
            this.nbShownBarcodes += 10
        },
        lessBarcodes() {
            this.nbShownBarcodes -= 1
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
            const approximateBarHeight = 20
            const chartHeight = approximateBarHeight * this.filteredD3Data.length
            const dataMax = d3.max(this.filteredD3Data.map((d) => d.blocks[d.blocks.length - 1]))

            const xMin = d3.min(this.filteredD3Data.map((d) => d.blocks[0]))
            const xMax = chartUtils.getXMax(this.genomeSize, dataMax)

            const { svg, width, height, margin } = chartUtils.setSvg(this.idGraph, this.$refs[this.idGraph].getBoundingClientRect().width, { height: chartHeight, margin: { left: 180, right: 100 } })
            const xScale = d3.scaleLinear().range([0, width]).domain([xMin, xMax])
            const xAxis = d3.axisBottom(xScale)
            const xLegend = svg.append('g')
                .attr('transform', 'translate(0,' + height + ')')
                .call(xAxis)
                // .selectAll('text')
                //     .attr('transform', 'translate(-10,0)rotate(-45)')
                //     .style('text-anchor', 'end')

            const yScale = d3.scaleBand()
                .domain(this.filteredD3Data.map((d) => d.barcode))
                .range([0, height])
                // .padding(0.1) // Adding padding messes up chart height computation
            const yAxis = d3.axisLeft(yScale)
            const yLegend = svg.append('g').classed('barcode-axis', true).call(yAxis)

            const barcodes = svg.select('.barcode-axis')
                .selectAll('.tick text')
                .classed('link', () => self.fastqFile && self.fastqFile.length !== 0)
                .attr('data-barcode', (d) => d)
                .on('click', function (event) {
                    if (event.target.classList.contains('link')) {
                        d3.select(this).classed('link', false)
                        self.saveBarcodeDetails(event.target.dataset.barcode)
                    }
                })

            const yScaleRight = d3.scaleBand()
                .domain(this.filteredD3Data)
                .range([0, height])
                .padding(0.1)
            const yAxisRight = d3.axisRight(yScaleRight).tickFormat((d) => d.count > 0 ? d.count : '')
            const yLegendRight = svg.append('g').attr('transform', `translate(${width}, 0)`).call(yAxisRight)

            const entries = svg.selectAll()
                .data(this.filteredD3Data)
                .enter()

            entries.each((d, i) => {
                d.blocks.forEach(() => {
                    if (i < d.blocks.length - 1) {
                        entries.append('rect')
                            .attr('data-start', (d) => d.blocks[i])
                            .attr('data-end', (d) => d.blocks[i + 1])
                            .attr('data-count', (d) => d.count)
                            .attr('x', (d) => xScale(d.blocks[i]))
                            .attr('y', (d) => i % 2 === 0 ? yScale(d.barcode) : yScale(d.barcode) + yScale.bandwidth() / 2)
                            .attr('height', () => i % 2 === 0 ? yScale.bandwidth() : 0.6)
                            .attr('width', (d) => xScale(d.blocks[i + 1] - d.blocks[i]))
                            .classed('rectangle', true)
                            .classed('tooltipable', () => i % 2 === 0)
                    }
                })
            })
            
            const tooltip = tooltipUtils.set(this.idGraph)
            const blocks = svg.selectAll('.tooltipable')
            blocks
            .on('mouseover', function (event) {
                const opacity = chartUtils.theme.lollipop.nonFocusOpacity
                blocks.style('opacity', opacity)
                d3.select(this).style('opacity', 1)

                tooltip.style('opacity', 1)
            })
            .on('mousemove', function (event) {
                tooltipUtils.setCoordinates(event, tooltip)
                const start = chartUtils.getDatasetInteger(event, "start")
                const end = chartUtils.getDatasetInteger(event, "end")
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
    &__helper {
        margin-bottom: 20px;
    }

    &__alert {
        display: flex;
        align-items: center;
        justify-content: center;
    }

    &__error {
        margin-top: 20px;
        color: var(--alert);
    }

    &__sticky-cta {
        display: flex;
        justify-content: center;
        gap: 20px;
        position: sticky;
        bottom: 20px;
        margin: auto;
        margin-bottom: 20px;
    }
}
</style>
