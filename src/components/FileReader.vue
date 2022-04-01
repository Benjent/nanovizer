<script>
export default {
    props: {
        id: {
            type: String,
            required: true,
        },
    },
    methods: {
        loadFile(e) {
            const file = e.target.files[0]
            const reader = new FileReader()
            reader.onload = (e) => this.$emit('load', e.target.result)
            reader.readAsText(file)
        },
    }
}
</script>

<template>
    <div class="l-file-reader">
        <label :for="id" class="button">Load file</label>
        <input type="file" class="button input--file" :id="id" @change="loadFile">
    </div>
</template>

<style lang="scss">
.l-file-reader {
    margin-bottom: 20px;
}
</style>
