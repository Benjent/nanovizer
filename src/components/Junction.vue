<template>
    <section class="entry">
        <h2 class="title title--2" id="junction">Junction</h2>
        <Failure v-if="!rawData">
            Missing data. Chart could not be drawn.
        </Failure>
        <div v-else>
            <div :id="idGraph" :ref="idGraph" class="entry__chart"></div>
            <div v-if="isScatterplotEnabled" :id="idGraphScatterplot" :ref="idGraphScatterplot" class="entry__chart"></div>
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
                <ChartSaver :id-graph="isScatterplotEnabled ? [idGraph, idGraphScatterplot] : idGraph" />
            </footer>
        </div>
    </section>
</template>

<script lang="js">
import * as d3 from 'd3'
import { mapState } from 'pinia'
import { useMainStore } from '../stores/main'
import chartUtils from '../utils/chart'
import numberUtils from '../utils/number'
import tooltipUtils from '../utils/tooltip'
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
            idGraph: 'd3GraphJunction',
            idGraphScatterplot: 'd3GraphJunctionScatterplot',
            max: 0,
            d3Data: undefined,
            threshold: 0,
            isScatterplotEnabled: false,
        }
    },
    computed: {
        ...mapState(useMainStore, ['genomeSize', 'nanoVizerData']),
        filteredD3Data() {
            if (!this.d3Data) { return }
            const { nodes, links } = this.d3Data
            const filteredLinks = links.filter((d) => d.value >= this.threshold)
            const filteredNodes = nodes.filter((d) => {
                const start = filteredLinks.map((d) => d.start).includes(d)
                const end = filteredLinks.map((d) => d.end).includes(d)
                return start || end
            })
            return { nodes: filteredNodes, links: filteredLinks}
        },
        percentageFilteredD3Data() {
            const ratio = this.d3Data && this.filteredD3Data ? this.filteredD3Data.links.length / this.d3Data.links.length : 1
            const percentage = ratio * 100
            return numberUtils.frFloat(numberUtils.decimal(percentage))
        },
        rawData() {
            return this.nanoVizerData.junction_count
        },
    },
    watch: {
        threshold() {
            this.drawGraphs()
        },
    },
    mounted() {
        if (!this.rawData) return
        this.d3Data = this.parseData(this.rawData)
        this.drawGraphs()
    },
    methods: {
        drawGraphs() {
            this.drawGraph()
            this.drawGraphScatterplot()
        },
        parseData(data) {
            const junctions = []
            data.forEach((d) => {
                junctions.push(d[`3_prime`])
                junctions.push(d[`5_prime`])
            })

            const unique = [...new Set(junctions)]
            unique.sort((a, b) => a - b)
            return {
                nodes: unique,
                links: data.map((d) => {
                    return {
                        start: d[`3_prime`],
                        end: d[`5_prime`],
                        value: d.count,
                    }
                }),
            }
        },
        drawGraph() {
            if (!this.$refs[this.idGraph] || !this.filteredD3Data) { return }
            const { nodes, links } = this.filteredD3Data
            const { svg, width, height, margin } = chartUtils.setSvg(this.idGraph, this.$refs[this.idGraph].getBoundingClientRect().width, { height: this.$refs[this.idGraph].getBoundingClientRect().width / 2 })
            const dataMax = d3.max(nodes)
            const xMax = chartUtils.getXMax(this.genomeSize, dataMax)
            this.max = d3.max(links.map((l) => l.value))

            const xScale = d3.scaleLinear().range([0, width]).domain([0, xMax])
            const xAxis = d3.axisBottom(xScale)
            const xLegend = svg.append('g')
            .attr('transform', 'translate(0,' + height + ')')
            .call(xAxis)

            const linkScale = d3.scaleLinear().domain([0, this.max]).range([0, 1])

            const arcs = svg
            .selectAll()
            .data(links)
            .enter()
            .append('path')
                .attr('data-value', (d) => d.value)
                .attr('d', (d) => {
                    const start = xScale(d.start)
                    const end = xScale(d.end)
                    return ['M', start, height,    // the arc starts at the coordinate x=start, y=height-30 (where the starting node is)
                        'A',                            // This means we're gonna build an elliptical arc
                        (start - end) / 2, ',',    // Next 2 lines are the coordinates of the inflexion point. Height of this point is proportional with start - end distance
                        (start - end) / 2, 0, 0, ',',
                        start < end ? 1 : 0, end, ',', height] // We always want the arc on top. So if end is before start, putting 0 here turn the arc upside down.
                        .join(' ')
                    })
                .style('fill', 'none')
                .style('opacity', (d) => linkScale(d.value))
                .classed('lollipop__stick', true)

            // const size = d3.scaleLinear()
            // .domain([1, 1000])
            // .range([2,10])

            const circles = svg
            .selectAll()
            .data(nodes)
            .enter()
            .append('circle')
                .attr('data-key', (d) => d)
                .attr('data-ends', (d) => {
                    const relatedLinks = links.filter((l) => [l.start, l.end].includes(d))
                    const flattenedLinks = []
                    relatedLinks.forEach((l) => {
                        if (d !== l.start) {
                            flattenedLinks.push(l.start)
                        }
                        if (d !== l.end) {
                            flattenedLinks.push(l.end)
                        }
                    })
                    const unique = [...new Set(flattenedLinks)]
                    unique.sort((a, b) => a - b)
                    return unique
                })
                .attr('cx', (d) => xScale(d))
                .attr('cy', height)
                .attr('r', chartUtils.theme.lollipop.sugar.radius)
                .classed('lollipop__sugar', true)

            // const labels = svg
            // .selectAll()
            // .data(nodes)
            // .enter()
            // .append('text')
            //     .attr('data-key', (d) => d)
            //     .attr('x', (d) => xScale(d))
            //     .attr('y', height - 10)
            //     .text((d) => d)
            //     .style('text-anchor', 'middle')
            //     .style('font-size', '0.71em')
            //     .style('color', 'pink')
            //     .style('fill', 'pink')
            //     .style('stroke', 'pink')
            //     .style('opacity', 0)

            const tooltip = tooltipUtils.set(this.idGraph)
            circles
            .on('mouseover', function (event) {
                const opacity = 0
                circles.style('opacity', opacity)
                d3.select(this).style('opacity', 1)

                const key = chartUtils.getDatasetInteger(event, "key")
                arcs.style('opacity', (l) => [l.start, l.end].includes(key) ? 1 : opacity)
                // labels.style('opacity', (l) => l === key ? 1 : 0)
                tooltip.style('opacity', 1)
            })
            .on('mousemove', function (event) {
                tooltipUtils.setCoordinates(event, tooltip)
                const key = chartUtils.getDatasetInteger(event, "key")
                const ends = event.target.dataset.ends.replaceAll(',', ', ')
                tooltip
                .html(`
                    <div>Position: ${key}</div>
                    <div>Junction with: ${ends}</div>
                `)
            })
            .on('mouseleave', function () {
                tooltipUtils.reset(tooltip)
                circles.style('opacity', 1)
                arcs.style('opacity', (d) => linkScale(d.value))
                // labels.style('opacity', 0)
            })
        },
        drawGraphScatterplot() {
            if (!this.$refs[this.idGraphScatterplot] || !this.filteredD3Data) { return }
            const { links } = this.filteredD3Data
            const { svg, width, height, margin } = chartUtils.setSvg(this.idGraphScatterplot, this.$refs[this.idGraphScatterplot].getBoundingClientRect().width)

            const xMax = d3.max(links.map((d) => d.start))
            const xScale = d3.scaleLinear().range([0, width]).domain([0, xMax])
            const xAxis = d3.axisBottom(xScale)
            const xLegend = svg.append('g').attr('transform', 'translate(0,' + height + ')').call(xAxis)
            
            const yMax = d3.max(links.map((d) => d.end))
            const yScale = d3.scaleLinear().range([height, 0]).domain([0, yMax])
            const yAxis = d3.axisLeft(yScale)
            const yLegend = svg.append('g').call(yAxis)

            const circles = svg.append('g')
            .selectAll('dot')
            .data(links)
            .enter()
            .append('circle')
                .attr('data-start', (d) => d.start)
                .attr('data-end', (d) => d.end)
                .attr('data-value', (d) => d.value)
                .attr('cx', (d) => xScale(d.start))
                .attr('cy', (d) => yScale(d.end))
                .attr('r', chartUtils.theme.lollipop.sugar.radius)
                .classed('lollipop__sugar', true)

            const tooltip = tooltipUtils.set(this.idGraphScatterplot)
            circles
            .on('mouseover', function (event) {
                const opacity = 0
                circles.style('opacity', opacity)
                d3.select(this).style('opacity', 1)
                tooltip.style('opacity', 1)
            })
            .on('mousemove', function (event) {
                tooltipUtils.setCoordinates(event, tooltip)
                const start = chartUtils.getDatasetInteger(event, "start")
                const end = chartUtils.getDatasetInteger(event, "end")
                const value = chartUtils.getDatasetInteger(event, "value")
                tooltip
                .html(`
                    <div>3' Position: ${start}</div>
                    <div>5' Position: ${end}</div>
                    <div>Junctions: ${value}</div>
                `)
            })
            .on('mouseleave', function () {
                tooltipUtils.reset(tooltip)
                circles.style('opacity', 1)
            })
            
            
        },
    },
}
</script>
