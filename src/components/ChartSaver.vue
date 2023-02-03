<script lang="js">
import { saveSvgAsPng } from 'save-svg-as-png'
import { mapState } from 'pinia'
import { useMainStore } from '../stores/main'
import dateUtils from '../utils/date'
import Icon from './Icon.vue'

export default {
    components: {
        Icon,
    },
    props: {
        idGraph: {
            type: [String, Array],
            required: true,
        },
    },
    data() {
        return {}
    },
    computed: {
        ...mapState(useMainStore, ['fileName', 'genomeName']),
        isMultipleGraphs() {
            return Array.isArray(this.idGraph)
        },
    },
    methods: {
        saveGraphs() {
            if (this.isMultipleGraphs) {
                this.idGraph.forEach((id) => {
                    this.saveGraph(id)
                })
            } else {
                this.saveGraph(this.idGraph)
            }
        },
        saveGraph(id) {
            const wrapper = document.getElementById(id)
            const wrapperChildren = [...wrapper.children]
            const svg = wrapperChildren.find((element) => element.tagName === 'svg')
            const now = new Date()
            const { year, month, day, hour, minute, second } = dateUtils.getCalendarDate(now)
            const imageName = `${this.fileName} ${this.genomeName} ${this.idGraph.replace("d3Graph", "")} ${year}-${month}-${day} ${hour}h${minute}m${second}s`
            saveSvgAsPng(svg, imageName)
        },
    },
}
</script>

<template>
    <button class="button" @click="saveGraphs"><Icon icon="file_download" />&nbsp;Save graph{{ isMultipleGraphs ? "s" : "" }}</button>
</template>
