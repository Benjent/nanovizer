<script lang="js">
import { mapState } from 'pinia'
import { useMainStore } from '../stores/main'
import dateUtils from '../utils/date'
import Icon from './Icon.vue'

export default {
    components: {
        Icon,
    },
    props: {
        idChart: {
            type: [String, Array],
            required: true,
        },
    },
    data() {
        return {
            isWithBackground: false,
        }
    },
    computed: {
        ...mapState(useMainStore, ['fileName', 'genomeName']),
        isMultipleCharts() {
            return Array.isArray(this.idChart)
        },
        idCheckbox() {
            return `${this.idChart}WithBackground`
        },
    },
    methods: {
        downloadChart(url) {
            const imageName = this.getImageName()
            const downloadLink = document.createElement('a')
            downloadLink.href = url
            downloadLink.download = `${imageName}.svg`
            document.body.appendChild(downloadLink)
            downloadLink.click()
            document.body.removeChild(downloadLink)
        },
        getImageName() {
            const now = new Date()
            const { year, month, day, hour, minute, second } = dateUtils.getCalendarDate(now)
            const prefix = `${this.fileName.replaceAll('.', '_')} ${this.genomeName}`
            const chartName = `${this.idChart.replace('d3Chart', '')}`
            const suffix = `${year}-${month}-${day} ${hour}h${minute}m${second}s`
            const imageName = `${prefix} ${chartName} ${suffix}`
            return imageName
        },
        getSvgNode(id) {
            const wrapper = document.getElementById(id)
            const wrapperChildren = [...wrapper.children]
            return wrapperChildren.find((element) => element.tagName === 'svg')
        },
        getXmlFromSvg(svg) {
            this.setStyleToSvg(svg)
        
            const serializer = new XMLSerializer()
            let source = serializer.serializeToString(svg)

            // Name spaces
            if(!source.match(/^<svg[^>]+xmlns="http\:\/\/www\.w3\.org\/2000\/svg"/)){
                source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"')
            }
            if(!source.match(/^<svg[^>]+"http\:\/\/www\.w3\.org\/1999\/xlink"/)){
                source = source.replace(/^<svg/, '<svg xmlns:xlink="http://www.w3.org/1999/xlink"')
            }

            return '<?xml version="1.0" standalone="no"?>\r\n' + source 
        },
        setStyleToSvg(svg) {
            const style = getComputedStyle(document.body)
            const primaryCssVariable = style.getPropertyValue('--primary')
            const chartAxisCssVariable = style.getPropertyValue('--chart-axis')
            const chartDataCssVariable = style.getPropertyValue('--chart-data')

            const fragment = document.createDocumentFragment()
            const styleTag = fragment.appendChild(document.createElement('style'))
            styleTag.textContent = `
                .domain { stroke: ${chartAxisCssVariable}; }
                .tick {
                    text { fill: ${chartAxisCssVariable}; stroke: none; }
                    line { stroke: ${chartAxisCssVariable}; }
                }
                .boxplot__line { stroke: ${primaryCssVariable} }
                .boxplot__box { fill: ${chartDataCssVariable} }
                .lollipop__sugar { fill: ${chartDataCssVariable} }
                .lollipop__stick { stroke: ${chartDataCssVariable} }
                .rectangle { fill: ${chartDataCssVariable} }
            `
            svg.prepend(fragment)

            if (this.isWithBackground) {
                const backgroundCssVariable = style.getPropertyValue('--background')
                svg.style = `background: ${backgroundCssVariable};`
            }
        },
        saveCharts() {
            if (this.isMultipleCharts) {
                this.idChart.forEach((id) => {
                    this.saveChart(id)
                })
            } else {
                this.saveChart(this.idChart)
            }
        },
        saveChart(id) {
            const svg = this.getSvgNode(id)

            // Prevent from altering DOM node
            const standaloneSvg = svg.cloneNode(true)
            const source = this.getXmlFromSvg(standaloneSvg)
            const svgUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(source)}`

            this.downloadChart(svgUrl)
        },
    },
}
</script>

<template>
    <div class="l-chart-saver">
        <button class="button" @click="saveCharts"><Icon icon="file_download" />&nbsp;Save chart{{ isMultipleCharts ? "s" : "" }}</button>
        <label :for="idCheckbox">
            <input type="checkbox" :id="idCheckbox" v-model="isWithBackground" />
            With background
        </label>
    </div>
</template>

<style lang="scss">
// TODO style checkbox inputs
.l-chart-saver {
    display: flex;
    gap: 20px;
    align-items: center;
}
</style>
