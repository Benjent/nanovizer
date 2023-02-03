<template>
    <button class="button button--text l-switch-theme" @click="toggleTheme">
        <Icon :icon="themeIcon" />&nbsp;{{themeText}}
    </button>
</template>

<script>
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
    methods: {
        toggleTheme() {
            document.body.classList.toggle("light")
            this.themeIcon = document.body.classList.contains("light") ? 'dark_mode' : 'light_mode'
            this.themeText = document.body.classList.contains("light") ? 'Dark theme' : 'Light theme'
        },
    },
}
</script>

<style lang="scss">
.l-switch-theme {
    position: absolute;
    top: 20px;
    right: 20px;
    z-index: 1;
    font-size: 0.8rem;
}
</style>
