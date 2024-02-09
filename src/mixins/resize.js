export default {
    created() {
        window.addEventListener('resize', this.drawChart)
    },
    unmounted() {
        window.removeEventListener('resize', this.drawChart)
    },
}