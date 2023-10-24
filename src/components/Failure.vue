<template>
    <div class="l-failure">
        <Icon icon="warning" />&nbsp;<slot></slot>
    </div>
</template>

<script lang="js">
import Icon from './Icon.vue'

export default {
    components: {
        Icon,
    },
}
</script>

<style lang="scss">
.l-failure {
    display: flex;
    justify-content: center;
    align-items: center;
    color: var(--alert);
}
</style>
