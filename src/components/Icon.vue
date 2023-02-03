<script>
export default {
    props: {
        icon: {
            // https://fonts.google.com/icons
            type: String,
            required: true,
        },
    },
}
</script>

<template>
    <span class="l-icon material-symbols-outlined">{{icon}}</span>
</template>

<style lang="scss">
.l-icon {
    font-size: 1.2rem;
}
</style>
