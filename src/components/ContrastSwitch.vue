<template>
    <button class="button button--text" @click="toggleContrast">
        <Icon :icon="contrastIcon" />&nbsp;{{contrastText}}
    </button>
</template>

<script lang="js">
import { mapWritableState } from 'pinia'
import { useMainStore } from '../stores/main'
import Icon from './Icon.vue'

export default {
    components: {
        Icon,
    },
    data() {
        return {
            contrastIcon: 'contrast',
            contrastText: 'High contrast',
        }
    },
    computed: {
        ...mapWritableState(useMainStore, ['isContrasted']),
    },
    methods: {
        toggleContrast() {
            this.isContrasted = !this.isContrasted
            document.body.classList.toggle('contrasted')
            this.contrastIcon = this.isContrasted ? 'contrast_rtl_off' : 'contrast'
            this.contrastText = this.isContrasted ? 'Low contrast' : 'High contrast'
        },
    },
}
</script>
