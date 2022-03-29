<script>
export default {
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
    <label>
        <input type="file" @change="loadFile">
    </label>
</template>
