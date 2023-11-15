<template>
    <section class="entry">
        <h2 class="title title--2" :id="`${type}Site`">{{graphTitle}}</h2>
        <Failure v-if="!rawData">
            Missing data. Chart could not be drawn.
        </Failure>
        <div v-else>
            <div :id="idGraph" :ref="idGraph" class="entry__graph"></div>
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
                <ChartSaver :id-graph="idGraph" />
            </footer>
        </div>
    </section>
</template>

<script lang="js">
import { mapState } from 'pinia'
import { useMainStore } from '../stores/main'
import chartUtils from '../utils/chart'
import numberUtils from '../utils/number'
import resizeMixin from '../mixins/resize'
import ChartSaver from './ChartSaver.vue'
import Failure from './Failure.vue'

export default {
    mixins: [resizeMixin],
    components: {
        ChartSaver,
        Failure,
    },
    props: {
        type: {
            type: String,
            required: true,
            validator: (value) => {
                return ["start", "end"].includes(value)
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
        idGraph() {
            return `d3Graph${this.type}Site`
        },
        graphTitle() {
            return `${this.type.charAt(0).toUpperCase()}${this.type.slice(1)} site`
        },
        percentageFilteredD3Data() {
            const ratio = this.d3Data && this.filteredD3Data ? this.filteredD3Data.length / this.d3Data.length : 1
            const percentage = ratio * 100
            return numberUtils.frFloat(numberUtils.decimal(percentage))
        },
        rawData() {
            return this.nanoVizerData[`${this.type}_site_count`]
        },
    },
    watch: {
        threshold() {
            this.drawGraph()
        },
    },
    mounted() {
        if (!this.rawData) return
        this.d3Data = chartUtils.parseData(this.rawData)
        this.drawGraph()
    },
    methods: {
        drawGraph() {
            if (!this.$refs[this.idGraph] || !this.filteredD3Data) { return }
            const { svg, width, height, margin } = chartUtils.setSvg(this.idGraph, this.$refs[this.idGraph].getBoundingClientRect().width)
            const { xScale, xAxis, xMax, yScale, yAxis, yMax } = chartUtils.setScales(this.filteredD3Data, svg, width, height, { max: this.genomeSize })
            const { lines, circles } = chartUtils.drawLollipops(this.idGraph, this.filteredD3Data, svg, xScale, yScale)

            this.max = yMax
        },
    },
}
</script>
