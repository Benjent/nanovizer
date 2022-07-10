export default {
    created() {
        window.addEventListener('resize', this.drawGraph)
    },
    unmounted() {
        window.removeEventListener('resize', this.drawGraph)
    },
}