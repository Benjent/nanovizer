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
    <span class="material-symbols-outlined">{{icon}}</span>
</template>
