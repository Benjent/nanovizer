<script setup>
import { saveSvgAsPng } from 'save-svg-as-png'
</script>

<script>
export default {
    props: {
        idGraph: {
            type: String,
            required: true,
        },
    },
    methods: {
        saveGraph() {
            const wrapper = document.getElementById(this.idGraph)
            const wrapperChildren = [...wrapper.children]
            const svg = wrapperChildren.find((element) => element.tagName === 'svg')
            saveSvgAsPng(svg, this.idGraph)
        },
    },
}
</script>

<template>
    <button class="button" @click="saveGraph">Save graph</button>
</template>
