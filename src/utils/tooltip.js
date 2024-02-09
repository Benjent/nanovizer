import * as d3 from 'd3'

const set = (idChart) => {
    return d3.select(`#${idChart}`)
        .append('div')
            .style('opacity', 0)
            .attr('class', 'tooltip')
            .style('position', 'absolute')
}

const setCoordinates = (event, tooltip) => {
    const leftOffset = 50
    tooltip
        .style('left', (d3.pointer(event)[0] + leftOffset) + 'px')
        .style('top', (d3.pointer(event)[1]) + 'px')
        .style('width', 'auto')
        .style('height', 'auto')
}

const reset = (tooltip) => {
    tooltip
        .style('opacity', 0)
        .style('left', 0 + 'px') // Prevent from being out of the webapp width on window resize
        .style('top', 0 + 'px')
        .style('width', 0 + 'px')
        .style('height', 0 + 'px')
}

export default {
    reset,
    set,
    setCoordinates,
}
