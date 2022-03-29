import * as d3 from 'd3'

const parseTsv = (data) => {
    const parsedData = d3.tsvParse(data)
    return parsedData.map((d) => {
        return {
            key: Number.parseInt(d[`3'junction`] || d[`5'junction`] || d.start_site || d.nb_blocks),
            value: Number.parseInt(d.count || d.Count),
        }
    })
}

const setSvg = (id, wrapperWidth, rawHeight = 500) => {
    const margin = { top: 10, right: 30, bottom: 90, left: 40 }
    const width = wrapperWidth - margin.left - margin.right
    const height = rawHeight - margin.top - margin.bottom

    d3.select(`#${id} svg`).remove()
    const svg = d3.select(`#${id}`)
    .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
    .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")")

    return { svg, width, height, margin }
}

const setScales = (data, svg, width, height, options = {}) => {
    const keys = data.map((d) => d.key)
    const xMax = d3.max(keys)
    const xScale = options.sorted
        ? d3.scaleBand().range([0, width]).domain(keys)
        : d3.scaleLinear().range([0, width]).domain([0, xMax])

    const xAxis = d3.axisBottom(xScale)

    const xLegend = svg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis)
    .selectAll("text")
        .attr("transform", "translate(-10,0)rotate(-45)")
        .style("text-anchor", "end");

    const yMax = d3.max(data.map((d) => d.value))
    const yScale = d3.scaleLinear()
    .domain([0, yMax])
    .range([height, 0])

    const yAxis = d3.axisLeft(yScale)

    const yLegend = svg.append("g")
    .call(yAxis)

    return { xScale, xAxis, xMax, yScale, yAxis, yMax }
}

const drawLollipops = (data, svg, xScale, yScale) => {
    // Lines
    const lines = svg.selectAll()
    .data(data)
    .enter()
    .append("line")
        .attr("x1", (d) => xScale(d.key))
        .attr("x2", (d) => xScale(d.key))
        .attr("y1", (d) => yScale(d.value))
        .attr("y2", yScale(0))
        .attr("stroke", "grey")
        .classed('stem', true)

    // Circles
    const circles = svg.selectAll()
    .data(data)
    .enter()
    .append("circle")
        .attr("cx", (d) => xScale(d.key))
        .attr("cy", (d) => yScale(d.value))
        .attr("r", "4")
        .style("fill", "#69b3a2")
        .attr("stroke", "black")
        .classed('flower', true)

    return { lines, circles }
}

export default {
    drawLollipops,
    parseTsv,
    setScales,
    setSvg,
}
