<template>
    <button class="button button--text" @click="toggleTheme">
        <Icon :icon="themeIcon" />&nbsp;{{themeText}}
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
            themeIcon: 'light_mode',
            themeText: 'Light theme',
        }
    },
    computed: {
        ...mapWritableState(useMainStore, ['theme']),
    },
    methods: {
        toggleTheme() {
            this.theme === 'dark' ? this.theme = 'light' : this.theme = 'dark'
            document.body.classList.toggle('light')
            this.themeIcon = this.theme === 'dark' ? 'light_mode' : 'dark_mode'
            this.themeText = this.theme === 'dark' ? 'Light theme' : 'Dark theme'
        },
    },
}
</script>
