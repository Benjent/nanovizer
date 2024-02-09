<template>
    <section class="entry">
        <h2 class="title title--2" id="blockCount">Block count</h2>
        <Failure v-if="!rawData">
            Missing data. Chart could not be drawn.
        </Failure>
        <div v-else>
            <div :id="idChart" :ref="idChart" class="entry__chart"></div>
            <footer v-if="d3Data" class="entry__footer">
                <div class="data">
                    <label class="data__label">Max</label>
                    <output class="data__value">{{max}}</output>
                </div>
                <ChartSaver :id-chart="idChart" />
            </footer>
        </div>
    </section>
</template>

<script lang="js">
import { mapState } from 'pinia'
import { useMainStore } from '../stores/main'
import chartUtils from '../utils/chart'
import resizeMixin from '../mixins/resize'
import ChartSaver from './ChartSaver.vue'
import Failure from './Failure.vue'

export default {
    mixins: [resizeMixin],
    components: {
        ChartSaver,
        Failure,
    },
    data() {
        return {
            idChart: 'd3ChartBlockCount',
            max: 0,
            d3Data: undefined,
        }
    },
    computed: {
        ...mapState(useMainStore, ['nanoVizerData']),
        rawData() {
            return this.nanoVizerData.block_count
        },
    },
    mounted() {
        if (!this.rawData) return
        this.d3Data = chartUtils.parseData(this.rawData)
        this.drawChart()
    },
    methods: {
        drawChart() {
            if (!this.$refs[this.idChart] || !this.d3Data) { return }
            const { svg, width, height, margin } = chartUtils.setSvg(this.idChart, this.$refs[this.idChart].getBoundingClientRect().width)
            const { xScale, xAxis, xMax, yScale, yAxis, yMax } = chartUtils.setScales(this.d3Data, svg, width, height, { nice: true })
            const { lines, circles } = chartUtils.drawLollipops(this.idChart, this.d3Data, svg, xScale, yScale)

            this.max = yMax
        },
    },
}
</script>
