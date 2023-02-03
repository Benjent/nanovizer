<script setup>
import { saveSvgAsPng } from 'save-svg-as-png'
import Icon from './Icon.vue'
</script>

<script lang="js">
export default {
    components: {
        Icon,
    },
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
    <button class="button" @click="saveGraph"><Icon icon="file_download" />&nbsp;Save graph</button>
</template>
