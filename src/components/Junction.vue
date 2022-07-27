<script setup>
import * as d3 from 'd3'
import chartUtils from '../utils/chart'
import numberUtils from '../utils/number'
import tooltipUtils from '../utils/tooltip'
import resizeMixin from '../mixins/resize'
import ChartSaver from './ChartSaver.vue'
</script>

<template>
    <section class="entry">
        <h2 class="title title--2" id="junction">Junction</h2>
        <div>
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

<script>
export default {
    mixins: [resizeMixin],
    components: {
        ChartSaver,
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
            idGraph: 'd3GraphJunction',
            max: 0,
            d3Data: undefined,
            threshold: 0,
        }
    },
    computed: {
        filteredD3Data() {
            if (!this.d3Data) { return }
            const { nodes, links, nodeLinks } = this.d3Data
            const filteredLinks = links.filter((d) => d.value >= this.threshold)
            const filteredNodes = nodes.filter((d) => {
                const start = filteredLinks.map((d) => d.start).includes(d)
                const end = filteredLinks.map((d) => d.end).includes(d)
                return start || end
            })
            const filteredNodeLinks = JSON.parse(JSON.stringify(nodeLinks))
            Object.entries(filteredNodeLinks).forEach(([key, value]) => {
                filteredNodeLinks[key] = value.filter((v) => filteredNodes.includes(v))
            })
            return { nodes: filteredNodes, links: filteredLinks, nodeLinks: filteredNodeLinks }

            // TODO tester debounce event
            // TODO recentrer les tooltips
        },
        percentageFilteredD3Data() {
            const ratio = this.d3Data && this.filteredD3Data ? this.filteredD3Data.links.length / this.d3Data.links.length : 1
            const percentage = ratio * 100
            return numberUtils.frFloat(numberUtils.decimal(percentage))
        }
    },
    watch: {
        data(value) {
            if (value) {
                this.d3Data = this.parseData(value)
                this.drawGraph()
            }
        },
        threshold() {
            this.drawGraph()
        },
    },
    methods: {
        parseData(data) {
            // const nodes = data.reduce((positions, d) => {
            //     if (!positions.includes(d[`3_prime`])) {
            //         positions.push(d[`3_prime`])
            //     }
            //     if (!positions.includes(d[`5_prime`])) {
            //         positions.push(d[`5_prime`])
            //     }
            //     return positions
            // }, [])

            // const links = data.map((d) => {
            //     return {
            //         start: d[`3_prime`],
            //         end: d[`5_prime`],
            //         value: d.count,
            //     }
            // })

            const nodes = []
            const links = []
            const nodeLinks = {}

            data.forEach((d) => {
                if (!nodes.includes(d[`3_prime`])) {
                    nodes.push(d[`3_prime`])
                }
                if (!nodes.includes(d[`5_prime`])) {
                    nodes.push(d[`5_prime`])
                }

                links.push({
                    start: d[`3_prime`],
                    end: d[`5_prime`],
                    value: d.count,
                })
                
                if (!nodeLinks[d[`3_prime`]]) {
                    nodeLinks[d[`3_prime`]] = []
                }
                if (!nodeLinks[d[`3_prime`]].includes(d[`5_prime`])) {
                    nodeLinks[d[`3_prime`]].push(d[`5_prime`])
                }
                if (!nodeLinks[d[`5_prime`]]) {
                    nodeLinks[d[`5_prime`]] = []
                }
                if (!nodeLinks[d[`5_prime`]].includes(d[`3_prime`])) {
                    nodeLinks[d[`5_prime`]].push(d[`3_prime`])
                }
            })

            return { nodes, links, nodeLinks }
        },
        drawGraph() {
            if (!this.$refs[this.idGraph] || !this.filteredD3Data) { return }
            const { nodes, links, nodeLinks } = this.filteredD3Data
            const { svg, width, height, margin } = chartUtils.setSvg(this.idGraph, this.$refs[this.idGraph].getBoundingClientRect().width / 1.4, { height: this.$refs[this.idGraph].getBoundingClientRect().width / 2 })
            const dataMax = d3.max([...links.map((l) => l.start), ...links.map((l) => l.end)])
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

            const circles = svg
            .selectAll()
            .data(nodes)
            .enter()
            .append('circle')
                .attr('data-key', (d) => d)
                .attr('data-ends', (d) => {
                    return nodeLinks[d]
                })
                .attr('cx', (d) => xScale(d))
                .attr('cy', height)
                .attr('r', (d) => 4)
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

                const key = Number.parseInt(event.target.dataset.key)
                arcs.style('opacity', (l) => [l.start, l.end].includes(key) ? 1 : opacity)
                // labels.style('opacity', (l) => l === key ? 1 : 0)
                tooltip.style('opacity', 1)
            })
            .on('mousemove', function (event) {
                tooltipUtils.setCoordinates(event, tooltip)
                tooltip.style('left', event.clientX + 'px') // Somehow d3 messes up x position
                const key = Number.parseInt(event.target.dataset.key)
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
    },
}
</script>
