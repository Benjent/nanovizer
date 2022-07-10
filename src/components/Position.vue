<script setup>
import chartUtils from '../utils/chart'
import mathUtils from '../utils/math'
import numberUtils from '../utils/number'
import ChartSaver from './ChartSaver.vue'
</script>

<template>
    <section class="entry l-position">
        <h2 class="title title--2" :id="`position${type}`">{{type}}' Position</h2>
        <div>
            <div class="l-position__graphs">
                <div :id="idGraph" :ref="idGraph" class="entry__graph l-position__graphs__item"></div>
                <div :id="`${idGraph}Sorted`" :ref="`${idGraph}Sorted`" class="entry__graph l-position__graphs__item"></div>
            </div>
            <footer v-if="d3Data" class="entry__footer">
                <div class="data">
                    <label class="data__label">Seuil</label>
                    <input type="number" class="input data__value" v-model.number="threshold"/>
                </div>
                <div class="data">
                    <label class="data__label">Max</label>
                    <output class="data__value">{{max}}</output>
                </div>
                <div class="data">
                    <label class="data__label">Displayed data percentage</label>
                    <output class="data__value">{{percentageFilteredD3Data}}%</output>
                </div>
                <div class="l-position__actions">
                    <ChartSaver :id-graph="idGraph" />
                    <ChartSaver :id-graph="`${idGraph}Sorted`" />
                </div>
            </footer>
        </div>
    </section>
</template>

<script>
export default {
    components: {
        ChartSaver,
    },
    props: {
        data: {
            type: Array,
        },
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
            d3DataSorted: undefined,
            threshold: 0,
        }
    },
    computed: {
        filteredD3Data() {
            return this.d3Data?.filter((d) => d.value >= this.threshold)
        },
        filteredD3DataSorted() {
            return this.d3DataSorted?.filter((d) => d.value >= this.threshold)
        },
        idGraph() {
            return `d3Graph${this.type}Position`
        },
        percentageFilteredD3Data() {
            const ratio = this.d3Data && this.filteredD3Data ? this.filteredD3Data.length / this.d3Data.length : 1
            const percentage = ratio * 100
            return numberUtils.frFloat(numberUtils.decimal(percentage))
        },
    },
    watch: {
        data(value) {
            const parsedData = chartUtils.parseData(value)
            this.d3Data = mathUtils.sort(parsedData, 'key')
            this.d3DataSorted = mathUtils.sort(parsedData, 'value', 'DESC')
            this.drawGraphs()
        },
        threshold() {
            this.drawGraphs()
        },
    },
    created() {
        window.addEventListener('resize', this.drawGraphs)
    },
    unmounted() {
        window.removeEventListener('resize', this.drawGraphs)
    },
    methods: {
        drawGraphs() {
            this.drawGraph()
            this.drawGraphSorted()
        },
        drawGraph() {
            if (!this.$refs[this.idGraph] || !this.filteredD3Data) { return }
            const { svg, width, height, margin } = chartUtils.setSvg(this.idGraph, this.$refs[this.idGraph].getBoundingClientRect().width)
            const { xScale, xAxis, xMax, yScale, yAxis, yMax } = chartUtils.setScales(this.filteredD3Data, svg, width, height)
            const { lines, circles } = chartUtils.drawLollipops(this.idGraph, this.filteredD3Data, svg, xScale, yScale)

            this.max = yMax
        },
        drawGraphSorted() {
            if (!this.$refs[`${this.idGraph}Sorted`] || !this.filteredD3Data) { return }
            const { svg, width, height, margin } = chartUtils.setSvg(`${this.idGraph}Sorted`, this.$refs[`${this.idGraph}Sorted`].getBoundingClientRect().width)
            const { xScale, xAxis, xMax, yScale, yAxis, yMax } = chartUtils.setScales(this.filteredD3DataSorted, svg, width, height, { sorted: true })
            const { lines, circles } = chartUtils.drawLollipops(`${this.idGraph}Sorted`, this.filteredD3DataSorted, svg, xScale, yScale)
        },
    },
}
</script>

<style lang="scss">
.l-position {
    &__graphs {
        &__item {
            display: inline-block;
            width: 50%;
            box-sizing: border-box;
        }
    }

    &__actions {
        display: flex;
        justify-content: space-around;
    }
}
</style>
