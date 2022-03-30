<script setup>
import * as d3 from 'd3'
import chartUtils from '../utils/chart'
import numberUtils from '../utils/number'
import ChartSaver from './ChartSaver.vue'
import FileReader from './FileReader.vue'
</script>

<template>
    <section class="entry">
        <h2>Pairwise junction site</h2>
        <FileReader @load="parseFile" />
        <div>
            <div :id="idGraph" :ref="idGraph" class="entry__graph"></div>
            <footer v-if="d3Data">
                <div class="data">
                    <label class="data__label">Seuil</label>
                    <input type="number" v-model.number="threshold"/>
                </div>
                <div class="data">
                    <label class="data__label">Max</label>
                    <output class="data__value">{{max}}</output>
                </div>
                <div class="data">
                    <label class="data__label">Pourcentage de données affichées</label>
                    <output class="data__value">{{percentageFilteredD3Data}}%</output>
                </div>
                <ChartSaver :id-graph="idGraph" />
            </footer>
        </div>
    </section>
</template>

<script>
export default {
    components: {
        ChartSaver,
        FileReader,
    },
    data() {
        return {
            idGraph: 'd3GraphPairwiseJunctionSite',
            max: 0,
            d3Data: undefined,
            threshold: 0,
        }
    },
    computed: {
        filteredD3Data() {
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
        }
    },
    watch: {
        threshold(value) {
            this.drawGraph()
        },
    },
    methods: {
        parseFile(data) {
            this.d3Data = this.parseTsv(data)

            this.drawGraph()
        },
        parseTsv(data) {
            const parsedData = d3.tsvParse(data)
            const junctions = []
            parsedData.forEach((d) => {
                junctions.push(Number.parseInt(d[`3'`]))
                junctions.push(Number.parseInt(d[`5'`]))
            })

            const unique = [...new Set(junctions)]
            unique.sort((a, b) => a - b)
            return {
                nodes: unique,
                links: parsedData.map((d) => {
                    return {
                        start: Number.parseInt(d[`3'`]),
                        end: Number.parseInt(d[`5'`]),
                        value: Number.parseInt(d.count),
                    }
                }),
            }
        },
        drawGraph() {
            // https://d3-graph-gallery.com/graph/arc_highlight.html
            const { nodes, links } = this.filteredD3Data
            const { svg, width, height, margin } = chartUtils.setSvg(this.idGraph, this.$refs[this.idGraph].getBoundingClientRect().width / 2)
            const xMax = d3.max(nodes)
            this.max = d3.max(links.map((l) => l.value))

            const xScale = d3.scaleLinear().range([0, width]).domain([0, xMax])

            const arcs = svg
            .selectAll()
            .data(links)
            .enter()
            .append('path')
                .attr('d', (d) => {
                    const start = xScale(d.start)
                    const end = xScale(d.end)
                    return ['M', start, height - 30,    // the arc starts at the coordinate x=start, y=height-30 (where the starting node is)
                        'A',                            // This means we're gonna build an elliptical arc
                        (start - end) / 2, ',',    // Next 2 lines are the coordinates of the inflexion point. Height of this point is proportional with start - end distance
                        (start - end) / 2, 0, 0, ',',
                        start < end ? 1 : 0, end, ',', height - 30] // We always want the arc on top. So if end is before start, putting 0 here turn the arc upside down.
                        .join(' ');
                    })
                .style("fill", "none")
                .classed("lollipop__stick", true)

            // const size = d3.scaleLinear()
            // .domain([1, 1000])
            // .range([2,10])

            const circles = svg
            .selectAll()
            .data(nodes)
            .enter()
            .append("circle")
                .attr("data-key", (d) => d)
                .attr("cx", (d) => xScale(d))
                .attr("cy", height - 30)
                .attr("r", (d) => 4)
                .classed("lollipop__sugar", true)

            const labels = svg
            .selectAll()
            .data(nodes)
            .enter()
            .append("text")
                .attr("data-key", (d) => d)
                .attr("x", (d) => xScale(d))
                .attr("y", height - 10)
                .text((d) => d)
                .style("text-anchor", "middle")
                .style("font-size", "0.71em")
                .style("opacity", 0)

            circles
            .on('mouseover', function (d) {
                const opacity = 0.1
                circles.style('opacity', opacity)
                d3.select(this).style('opacity', 1)

                const key = Number.parseInt(d.target.dataset.key)

                arcs.style('opacity', (l) => [l.start, l.end].includes(key) ? 1 : opacity)
                labels.style('opacity', (l) => l === key ? 1 : 0)
            })
            .on('mouseout', function (d) {
                circles.style('opacity', 1)
                arcs.style('opacity', 1)
                labels.style('opacity', 0)
            })
        },
    },
}
</script>
