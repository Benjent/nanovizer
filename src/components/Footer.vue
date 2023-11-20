<script lang="js">
import nanovizerDarkThemeLogo from '@/assets/images/logos/nanovizer-dark-theme.svg'
import nanovizerLightThemeLogo from '@/assets/images/logos/nanovizer-light-theme.svg'
import { mapState } from 'pinia'
import { useMainStore } from '../stores/main'

export default {
    data() {
        return {
            email: 'benjent@hotmail.fr',
        }
    },
    computed: {
        ...mapState(useMainStore, ['theme']),
        logo() {
            return this.theme === 'dark' ? nanovizerDarkThemeLogo : nanovizerLightThemeLogo
        },
    },
}
</script>

<template>
    <footer class="l-footer">
        <img class="l-footer__logo" :src="logo" alt="Logo NanoViZer" />
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

    &__logo {
        width: 120px;
    }

    &__feedback {
        font-size: 0.8rem;
        margin: 20px 0;
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
