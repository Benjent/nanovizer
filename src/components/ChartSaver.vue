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
            // console.log(Array.from(document.getElementById(this.idGraph).children))
            // Array.from(document.getElementById(this.idGraph).children).filter((n) => n.tagName === 'svg')
            // console.log(document.getElementById(this.idGraph).children)
            saveSvgAsPng(document.getElementById(this.idGraph).children[0], this.idGraph)
        },
    },
}
</script>

<template>
    <label>
        <button class="button" @click="saveGraph">Enregistrer la visualisation</button>
    </label>
</template>
