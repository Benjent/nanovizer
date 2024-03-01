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
            <p class="l-barcode__alert l-barcode__helper helper"><Icon icon="info" />&nbsp;Please be aware that in order to have a better visual representation of reads, consensus start and end positions are displayed.</p>
            <div>
                <div :id="idChart" :ref="idChart" class="entry__chart entry__chart--big"></div>
                <div class="l-barcode__sticky-cta">
                    <Loader v-if="isLoading" />
                    <template v-else>
                        <button class="button button--secondary" :disabled="isLoading" @click="moreBarcodes">
                            <Icon icon="playlist_add" />&nbsp;Reveal {{nbBarcodesToAdd}} more barcodes
                        </button>
                        <button v-if="filteredD3Data?.length > 1" class="button button--secondary" :disabled="isLoading" @click="lessBarcodes">
                            <Icon icon="remove" />&nbsp;Hide last barcode
                        </button>
                    </template>
                </div>
                <footer v-if="d3Data" class="entry__footer">
                    <div class="data">
                        <label class="data__label">Displayed data percentage</label>
                        <output class="data__value">{{percentageFilteredD3Data}}%</output>
                    </div>
                    <ChartSaver :id-chart="idChart" />
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
            idChart: 'd3ChartBarcode',
            isError: false,
            isLoading: false,
            isLoadingBarcode: false,
            d3Data: undefined,
            nbShownBarcodes: 10,
            nbBarcodesToAdd: 10,
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
                    this.drawChart()
                    this.isLoading = false
                }, 1)
            } else {
                this.drawChart()
            }
        },
    },
    mounted() {
        if (!this.rawData) return
        const parsedData = this.parseData(this.rawData)
        this.d3Data = mathUtils.sort(parsedData, 'count', 'DESC')
        this.drawChart()
    },
    methods: {
        moreBarcodes() {
            this.nbShownBarcodes += this.nbBarcodesToAdd
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
        drawChart() {
            const self = this

            if (!this.$refs[this.idChart] || !this.d3Data) { return }
            const barHeight = 20
            const chartHeight = Math.max(barHeight * this.filteredD3Data.length, 200)
            const dataMax = d3.max(this.filteredD3Data.map((d) => d.blocks[d.blocks.length - 1]))

            // const xMin = d3.min(this.filteredD3Data.map((d) => d.blocks[0]))
            const xMin = 0
            const xMax = chartUtils.getXMax(this.genomeSize, dataMax)

            const { svg, width, height, margin } = chartUtils.setSvg(this.idChart, this.$refs[this.idChart].getBoundingClientRect().width, { height: chartHeight, margin: { left: 320, right: 100 } })
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
            const yAxisRight = d3.axisRight(yScaleRight).tickFormat((d) => d.count > 0 ? d.count : '')
            const yLegendRight = svg.append('g').attr('transform', `translate(${width}, 0)`).call(yAxisRight)

            const entries = svg.selectAll()
                .data(this.filteredD3Data)
                .enter()

            entries.each((d) => {
                for (let i = 0; i < d.blocks.length - 1; i++) {
                    entries.append('rect')
                        .attr('data-start', (d) => d.blocks[i])
                        .attr('data-end', (d) => d.blocks[i + 1])
                        .attr('data-count', (d) => d.count)
                        .attr('x', (d) => xScale(d.blocks[i]))
                        // Strange behavior: the bandwidth value is correct: (chartHeight-marginBottom-marginTop) / this.filteredD3Data.length
                        // However the whole chart size increazes a bit for each new bar...
                        .attr('y', (d) => i % 2 === 0 ? yScale(d.barcode) : yScale(d.barcode) + yScale.bandwidth() / 2)
                        .attr('height', () => i % 2 === 0 ? yScale.bandwidth() : 0.6)
                        .attr('width', (d) => xScale(d.blocks[i + 1] - d.blocks[i]))
                        .classed('rectangle', true)
                        .classed('tooltipable', () => i % 2 === 0)
                }
            })
            
            const tooltip = tooltipUtils.set(this.idChart)
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
