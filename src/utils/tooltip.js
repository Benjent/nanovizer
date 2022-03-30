import * as d3 from 'd3'

const set = (idGraph) => {
    return d3.select(`#${idGraph}`)
        .append("div")
            .style("opacity", 0)
            .style("position", "absolute")
            .attr("class", "tooltip")
            .style("background-color", "white")
            .style("border", "solid")
            .style("border-width", "2px")
            .style("padding", "5px")
}

const setCoordinates = (event, tooltip) => {
    const leftOffset = 50
    tooltip
        .style("left", (d3.pointer(event)[0] + leftOffset) + "px")
        .style("top", (d3.pointer(event)[1]) + "px")
}

export default {
    set,
    setCoordinates,
}
