<script setup>
import * as d3 from 'd3'
import chartUtils from './utils/chart'
import FileReader from './components/FileReader.vue'
import BlockNumber from './components/BlockNumber.vue'
import Junction from './components/Junction.vue'
import PairwiseJunctionSite from './components/PairwiseJunctionSite.vue'
import ReadLength from './components/ReadLength.vue'
import StartSitePosition from './components/StartSitePosition.vue'
</script>

<script>
export default {
    components: {
        BlockNumber,
        FileReader,
        Junction,
        PairwiseJunctionSite,
        ReadLength,
        StartSitePosition,
    },
    methods: {
        drawTuto(data, id) {
            // TODO tooltip + valeur x et y
            // TODO barcode

            // https://d3-graph-gallery.com/graph/interactivity_zoom.html
            // set the dimensions and margins of the graph
            const { svg, width, height, margin } = chartUtils.setSvg(id)

            // Add X axis
            const xMax = d3.max(data.map((d) => d.key))
            const x = d3.scaleLinear().domain([0, xMax]).range([0, width])
            const xAxis = svg.append("g")
                .attr("transform", "translate(0," + height + ")")
                .call(d3.axisBottom(x))

            // Add Y axis
            const yMax = d3.max(data.map((d) => d.value))
            const y = d3.scaleLinear().domain([0, yMax]).range([height, 0])
            const yAxis = svg.append("g")
                .call(d3.axisLeft(y))

            // Add a clipPath: everything out of this area won't be drawn.
            const clip = svg.append("defs").append("svg:clipPath")
                .attr("id", "clip")
                .append("svg:rect")
                    .attr("width", width )
                    .attr("height", height )
                    .attr("x", 0)
                    .attr("y", 0)

            // Create the scatter variable: where both the circles and the brush take place
            const scatter = svg.append('g')
                .attr("clip-path", "url(#clip)")

            const { lines, circles } = chartUtils.drawLollipops(data, scatter, x, y)

            // Set the zoom and Pan features: how much you can zoom, on which part, and what to do when there is a zoom
            const zoom = d3.zoom()
                .scaleExtent([1, 10])  // This control how much you can unzoom (x0.5) and zoom (x20)
                .extent([[0, 0], [width, height]])
                .on("zoom", updateChart);

            // This add an invisible rect on top of the chart area. This rect can recover pointer events: necessary to understand when the user zoom
            svg.append("rect")
                .attr("width", width)
                .attr("height", height)
                .style("fill", "none")
                .style("pointer-events", "all")
                .call(zoom);
            // now the user can zoom and it will trigger the function called updateChart

            function updateChart(event) {
                const newXScale = event.transform.rescaleX(x)
                const newYScale = event.transform.rescaleY(y)

                xAxis.call(d3.axisBottom(newXScale))
                yAxis.call(d3.axisLeft(newYScale))

                scatter
                .selectAll("circle")
                .attr('cx', (d) => newXScale(d.key))
                .attr('cy', (d) => newYScale(d.value))

                scatter
                .selectAll(".stem")
                .attr("x1", (d) => newXScale(d.key))
                .attr("x2", (d) => newXScale(d.key))
                .attr("y1", (d) => newYScale(d.value))
                .attr("y2", newYScale(0))
            }
        },
    }
}
</script>

<template>
    <main class="l-graphs">
        <ReadLength />
        <hr />
        <BlockNumber />
        <hr />
        <StartSitePosition />
        <hr />
        <Junction :type="3"/>
        <hr />
        <Junction :type="5"/>
        <hr />
        <PairwiseJunctionSite />
    </main>
</template>

<style lang="scss">
@import './assets/styles/main.scss';
@import './assets/base.css'; // TODO refact

.l-graphs {
    margin: 0 auto;
    width: 100%;
    text-align: center;
    font-weight: normal;
}
</style>
