export default {
    created() {
        window.addEventListener('resize', this.drawGraph)
    },
    destroyed() {
        window.removeEventListener('resize', this.drawGraph)
    },
}