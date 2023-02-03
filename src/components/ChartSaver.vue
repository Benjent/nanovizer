<script lang="js">
import { saveSvgAsPng } from 'save-svg-as-png'
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
            saveSvgAsPng(svg, id)
        },
    },
}
</script>

<template>
    <button class="button" @click="saveGraphs"><Icon icon="file_download" />&nbsp;Save graph{{ isMultipleGraphs ? "s" : "" }}</button>
</template>
