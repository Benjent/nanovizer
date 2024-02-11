import debounce from 'lodash.debounce'
import { DEBOUNCE_VALUE } from '../globals'

export default {
    created() {
        window.addEventListener('resize', debounce(this.drawChart, DEBOUNCE_VALUE))
    },
    unmounted() {
        window.removeEventListener('resize', this.drawChart)
    },
}