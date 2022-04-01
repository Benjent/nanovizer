<script setup>
import * as d3 from 'd3'
import chartUtils from '../utils/chart'
import tooltipUtils from '../utils/tooltip'
import ChartSaver from './ChartSaver.vue'
import FileReader from './FileReader.vue'
</script>

<template>
    <section class="entry">
        <h2 class="title title--2">Bar code</h2>
        <FileReader id="fileBarCode" @load="parseFile" />
        <div>
            <div :id="idGraph" :ref="idGraph" class="entry__graph"></div>
            <footer v-if="d3Data" class="entry__footer">
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
            idGraph: 'd3GraphBarCode',
            d3Data: undefined,
        }
    },
    methods: {
        parseFile(data) {
            this.d3Data = this.parseTsv(data)
            this.drawGraph()
        },
        parseTsv(data) {
            const parsedData = d3.tsvParse(data)
            return parsedData.map((d) => {
                const blocks = d.Barcode.split('_')
                return {
                    barCode: d.Barcode,
                    blocks: blocks.map((b) => Number.parseInt(b)),
                }
            })
        },
        drawGraph() {
            const { svg, width, height, margin } = chartUtils.setSvg(this.idGraph, this.$refs[this.idGraph].getBoundingClientRect().width, { margin: { left: 180 } })
            const nbBarCodeBlocks = 3
            const xMin = d3.min(this.d3Data.map((d) => d.blocks[0]))
            const xMax = d3.max(this.d3Data.map((d) => d.blocks[nbBarCodeBlocks - 1]))
            const xScale = d3.scaleLinear().range([0, width]).domain([xMin, xMax])
            const xAxis = d3.axisBottom(xScale)
            const xLegend = svg.append('g')
                .attr('transform', 'translate(0,' + height + ')')
                .call(xAxis)
                .selectAll('text')
                    .attr('transform', 'translate(-10,0)rotate(-45)')
                    .style('text-anchor', 'end')

            const yScale = d3.scaleBand()
                .domain(this.d3Data.map((d) => d.barCode))
                .range([height, 0])
                .padding(0.1)
            const yAxis = d3.axisLeft(yScale)
            const yLegend = svg.append('g').call(yAxis)

            const bars = svg.selectAll()
                .data(this.d3Data)
                .enter()
            
            for (let i = 0; i < nbBarCodeBlocks; i++) {
                bars.append('rect')
                    .attr('data-start', (d) => d.blocks[i])
                    .attr('data-end', (d) => d.blocks[i + 1])
                    .attr('x', (d) => xScale(d.blocks[i]))
                    .attr('y', (d) => i % 2 === 0 ? yScale(d.barCode) : yScale(d.barCode) + yScale.bandwidth() / 2)
                    .attr('height', () => i % 2 === 0 ? yScale.bandwidth() : 0)
                    .attr('width', (d) => xScale(d.blocks[i + 1] - d.blocks[i]))
                    .classed('rectangle', true)
            }

            const tooltip = tooltipUtils.set(this.idGraph)
            const blocks = svg.selectAll('.rectangle')
            blocks
            .on('mouseover', function (event) {
                const opacity = 0.1
                blocks.style('opacity', opacity)
                d3.select(this).style('opacity', 1)

                tooltip.style('opacity', 1)
            })
            .on('mousemove', function (event) {
                tooltipUtils.setCoordinates(event, tooltip)
                // tooltip.style('left', event.clientX + 'px') // Somehow d3 messes up x position
                const start = Number.parseInt(event.target.dataset.start)
                const end = Number.parseInt(event.target.dataset.end)
                tooltip
                .html(`
                    <div>Start: ${start}</div>
                    <div>End: ${end}</div>
                `)
            })
            .on('mouseleave', function () {
                blocks.style('opacity', 1)
                tooltip.style('opacity', 0)
            })

            // TODO input commun de taille de génôme
            // TODO style data -> mettre en aside?
        },
    },
}
</script>
