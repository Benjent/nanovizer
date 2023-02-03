<script lang="js">
export default {
    data() {
        return {
            email: 'benjent@hotmail.fr',
        }
    },
}
</script>

<template>
    <footer class="l-footer">
        <p class="l-footer__feedback">
            Like this webapp? Have a feedback? Give me a shout at {{email}}!
        </p>
        <div class="l-footer__logos">
            <img src="../assets/images/logos/cnrs.svg" alt="Logo CNRS" />
            <img src="../assets/images/logos/inserm.svg" alt="Logo Inserm" />
            <img src="../assets/images/logos/institut-cochin.svg" alt="Logo Institut Cochin" />
            <img src="../assets/images/logos/universite-paris-cite.svg" alt="Logo Université Paris Cité" />
        </div>
    </footer>
</template>

<style lang="scss">
.l-footer {
    padding: 20px 60px;
    background: var(--background-footer);

    &__feedback {
        font-size: 0.8rem;
        margin-bottom: 20px;
    }

    &__logos {
        display: flex;
        justify-content: center;

        img {
            height: 60px;
            margin: 0 10px;
        }
    }
}
</style>
