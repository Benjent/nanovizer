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
    <label>
        <button @click="saveGraph">Enregistrer la visualisation</button>
    </label>
</template>
