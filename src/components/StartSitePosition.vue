<script setup>
import chartUtils from '../utils/chart'
import numberUtils from '../utils/number'
import resizeMixin from '../mixins/resize'
import ChartSaver from './ChartSaver.vue'
import FileReader from './FileReader.vue'
</script>

<template>
    <section class="entry">
        <h2 class="title title--2">Start site position</h2>
        <FileReader :id="'fileStartSitePosition'" @load="parseFile" />
        <div>
            <div :id="idGraph" :ref="idGraph" class="entry__graph"></div>
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
        FileReader,
    },
    data() {
        return {
            idGraph: 'd3GraphStartSitePosition',
            max: 0,
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
            this.d3Data = chartUtils.parseTsv(data)

            this.drawGraph()
        },
        drawGraph() {
            if (!this.$refs[this.idGraph] || !this.filteredD3Data) { return }
            const { svg, width, height, margin } = chartUtils.setSvg(this.idGraph, this.$refs[this.idGraph].getBoundingClientRect().width)
            const { xScale, xAxis, xMax, yScale, yAxis, yMax } = chartUtils.setScales(this.filteredD3Data, svg, width, height)
            const { lines, circles } = chartUtils.drawLollipops(this.idGraph, this.filteredD3Data, svg, xScale, yScale)

            this.max = yMax
        },
    },
}
</script>
