import * as d3 from 'd3'
import tooltipUtils from './tooltip'

const getXMax = (max, dataMax) => {
    return max ? Math.max(max, dataMax) : dataMax
}

const parseData = (data) => {
    return data.map((d) => {
        return {
            key: Object.entries(d)[0][0],
            value: Object.entries(d)[0][1],
        }
    })
}

const setSvg = (id, wrapperWidth, options = {}) => {
    const margin = Object.assign({ top: 10, right: 30, bottom: 50, left: 40 }, options.margin) // Warning: increasing left value from 40 to 50 messes up tooltip position: TODO investigate
    const width = wrapperWidth - margin.left - margin.right
    const height = (options.height || 320) - margin.top - margin.bottom

    d3.select(`#${id} svg`).remove()
    const svg = d3.select(`#${id}`)
    .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .classed('d3', true)
    .append('g')
        .attr('transform',
            'translate(' + margin.left + ',' + margin.top + ')')

    return { svg, width, height, margin }
}

const setScales = (data, svg, width, height, options = {}) => {
    const keys = data.map((d) => d.key)

    const dataMax = d3.max(keys)
    const xMax = options.max ? getXMax(options.max, dataMax) : dataMax

    const xScale = options.sorted
        ? d3.scaleBand().range([0, width]).domain(keys)
        : d3.scaleLinear().range([0, width]).domain([0, xMax])

    const xAxis = d3.axisBottom(xScale)
    if (options.nice && !options.sorted) {
        const integerTicks = xScale.ticks().filter((t) => Number.isInteger(t))
        xAxis.tickValues(integerTicks).tickFormat((t) => Number.parseInt(t))
    }

    const xLegend = svg.append('g')
    .attr('transform', 'translate(0,' + height + ')')
    .call(xAxis)

    if (data.length > 1000) {
        xLegend.selectAll('text')
        .attr('transform', 'translate(-10,0)rotate(-45)')
        .style('text-anchor', 'end')
    }

    if (options.sorted) {
        xLegend.selectAll('.tick')
            .style('opacity', 0)
    }

    const yMax = d3.max(data.map((d) => d.value))
    const yScale = d3.scaleLinear()
    .domain([0, yMax])
    .range([height, 0])

    const yAxis = d3.axisLeft(yScale)

    const yLegend = svg.append('g')
    .call(yAxis)

    return { xScale, xAxis, xMax, yScale, yAxis, yMax }
}

const drawLollipops = (idGraph, data, svg, xScale, yScale) => {
    const lines = svg.selectAll()
    .data(data)
    .enter()
    .append('line')
        .attr('data-key', (d) => d.key)
        .attr('data-value', (d) => d.value)
        .attr('x1', (d) => xScale(d.key))
        .attr('x2', (d) => xScale(d.key))
        .attr('y1', (d) => yScale(d.value))
        .attr('y2', yScale(0))
        .classed('lollipop__stick', true)

    const circles = svg.selectAll()
    .data(data)
    .enter()
    .append('circle')
        .attr('data-key', (d) => d.key)
        .attr('data-value', (d) => d.value)
        .attr('cx', (d) => xScale(d.key))
        .attr('cy', (d) => yScale(d.value))
        .attr('r', '4')
        .classed('lollipop__sugar', true)

    const tooltip = tooltipUtils.set(idGraph)

    circles
    .on('mouseover', function (event) {
        const opacity = 0.1
        circles.style('opacity', opacity)
        d3.select(this).style('opacity', 1)

        const key = Number.parseInt(event.target.dataset.key)
        lines.style('opacity', (l) => l.key === key ? 1 : opacity)

        tooltip.style('opacity', 1)
    })
    .on('mousemove', function (event) {
        tooltipUtils.setCoordinates(event, tooltip)
        const key = Number.parseInt(event.target.dataset.key)
        const value = Number.parseInt(event.target.dataset.value)
        tooltip
        .html(`
            <div>Junction: ${key}</div>
            <div>Occurrences: ${value}</div>
        `)
    })
    .on('mouseleave', function () {
        tooltipUtils.reset(tooltip)
        circles.style('opacity', 1)
        lines.style('opacity', 1)
    })

    return { lines, circles }
}

export default {
    drawLollipops,
    getXMax,
    parseData,
    setScales,
    setSvg,
}
