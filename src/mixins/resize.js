import debounce from 'lodash.debounce'

export default {
    created() {
        window.addEventListener('resize', debounce(this.drawChart, 400))
    },
    unmounted() {
        window.removeEventListener('resize', this.drawChart)
    },
}