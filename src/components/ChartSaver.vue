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
            saveSvgAsPng(document.getElementById(this.idGraph).children[0], this.idGraph)
        },
    },
}
</script>

<template>
    <button class="button" @click="saveGraph">Save graph</button>
</template>
