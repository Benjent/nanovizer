<template>
    <section class="entry l-position">
        <h2 class="title title--2" :id="`position${type}`">{{type}}' Position</h2>
        <Failure v-if="!rawData">
            Missing data. Chart could not be drawn.
        </Failure>
        <div v-else>
            <div :id="idChart" :ref="idChart" class="entry__chart"></div>
            <footer v-if="d3Data" class="entry__footer">
                <div class="data">
                    <label class="data__label">Threshold</label>
                    <input type="number" class="input data__value" v-model.number="threshold" min="0" />
                </div>
                <div class="data">
                    <label class="data__label">Max</label>
                    <output class="data__value">{{max}}</output>
                </div>
                <div class="data">
                    <label class="data__label">Displayed data percentage</label>
                    <output class="data__value">{{percentageFilteredD3Data}}%</output>
                </div>
                <ChartSaver :id-chart="idChart" />
            </footer>
        </div>
    </section>
</template>

<script lang="js">
import debounce from 'lodash.debounce'
import { mapState } from 'pinia'
import { useMainStore } from '../stores/main'
import chartUtils from '../utils/chart'
import mathUtils from '../utils/math'
import numberUtils from '../utils/number'
import ChartSaver from './ChartSaver.vue'
import Failure from './Failure.vue'

export default {
    components: {
        ChartSaver,
        Failure,
    },
    props: {
        type: {
            type: Number,
            required: true,
            validator: (value) => {
                return [3, 5].includes(value)
            }
        },
    },
    data() {
        return {
            max: 0,
            d3Data: undefined,
            threshold: 0,
        }
    },
    computed: {
        ...mapState(useMainStore, ['genomeSize', 'nanoVizerData']),
        filteredD3Data() {
            return this.d3Data?.filter((d) => d.value >= this.threshold)
        },
        idChart() {
            return `d3Chart${this.type}Position`
        },
        percentageFilteredD3Data() {
            const ratio = this.d3Data && this.filteredD3Data ? this.filteredD3Data.length / this.d3Data.length : 1
            const percentage = ratio * 100
            return numberUtils.frFloat(numberUtils.decimal(percentage))
        },
        rawData() {
            return this.nanoVizerData[`${this.type}_prime_count`]
        },
    },
    watch: {
        threshold: debounce(function() {
            this.drawChart()
        }, 400),
    },
    created() {
        window.addEventListener('resize', this.drawCharts)
    },
    unmounted() {
        window.removeEventListener('resize', this.drawCharts)
    },
    mounted() {
        if (!this.rawData) return
        const parsedData = chartUtils.parseData(this.rawData)
        this.d3Data = mathUtils.sort(parsedData, 'key')
        this.drawCharts()
    },
    methods: {
        drawCharts() {
            this.drawChart()
        },
        drawChart() {
            if (!this.$refs[this.idChart] || !this.filteredD3Data) { return }
            const { svg, width, height, margin } = chartUtils.setSvg(this.idChart, this.$refs[this.idChart].getBoundingClientRect().width)
            const { xScale, xAxis, xMax, yScale, yAxis, yMax } = chartUtils.setScales(this.filteredD3Data, svg, width, height, { max: this.genomeSize })
            const { lines, circles } = chartUtils.drawLollipops(this.idChart, this.filteredD3Data, svg, xScale, yScale)

            this.max = yMax
        },
        drawChartSorted() {
            if (!this.$refs[`${this.idChart}Sorted`] || !this.filteredD3Data) { return }
            const { svg, width, height, margin } = chartUtils.setSvg(`${this.idChart}Sorted`, this.$refs[`${this.idChart}Sorted`].getBoundingClientRect().width)
            const { xScale, xAxis, xMax, yScale, yAxis, yMax } = chartUtils.setScales(this.filteredD3DataSorted, svg, width, height, { max: this.genomeSize, sorted: true })
            const { lines, circles } = chartUtils.drawLollipops(`${this.idChart}Sorted`, this.filteredD3DataSorted, svg, xScale, yScale)
        },
    },
}
</script>
