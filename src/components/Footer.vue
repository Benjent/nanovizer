<script lang="js">
import cnrsDarkThemeLogo from '@/assets/images/logos/cnrs-dark-theme.gif'
import cnrsLightThemeLogo from '@/assets/images/logos/cnrs-light-theme.gif'
import insermDarkThemeLogo from '@/assets/images/logos/inserm-dark-theme.png'
import insermLightThemeLogo from '@/assets/images/logos/inserm-light-theme.png'
import institutCochinDarkThemeLogo from '@/assets/images/logos/institut-cochin-dark-theme.svg'
import institutCochinLightThemeLogo from '@/assets/images/logos/institut-cochin-light-theme.svg'
import nanovizerDarkThemeLogo from '@/assets/images/logos/nanovizer-dark-theme.svg'
import nanovizerLightThemeLogo from '@/assets/images/logos/nanovizer-light-theme.svg'
import universiteParisCiteDarkThemeLogo from '@/assets/images/logos/universite-paris-cite-dark-theme.svg'
import universiteParisCiteLightThemeLogo from '@/assets/images/logos/universite-paris-cite-light-theme.svg'
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
        cnrsLogo() {
            return this.theme === 'dark' ? cnrsDarkThemeLogo : cnrsLightThemeLogo
        },
        insermLogo() {
            return this.theme === 'dark' ? insermDarkThemeLogo : insermLightThemeLogo
        },
        institutCochinLogo() {
            return this.theme === 'dark' ? institutCochinDarkThemeLogo : institutCochinLightThemeLogo
        },
        nanovizerLogo() {
            return this.theme === 'dark' ? nanovizerDarkThemeLogo : nanovizerLightThemeLogo
        },
        universiteParisCiteLogo() {
            return this.theme === 'dark' ? universiteParisCiteDarkThemeLogo : universiteParisCiteLightThemeLogo
        },
    },
}
</script>

<template>
    <footer class="l-footer">
        <img class="l-footer__logo" :src="nanovizerLogo" alt="Logo NanoViZer" />
        <p class="l-footer__feedback">
            Like this webapp? Have a feedback? Give me a shout at {{email}}!
        </p>
        <div class="l-footer__logos">
            <img :src="cnrsLogo" alt="Logo CNRS" style="height: 3rem;" />
            <img :src="insermLogo" alt="Logo Inserm" style="height: 2rem;" />
            <img :src="institutCochinLogo" alt="Logo Institut Cochin" style="height: 6rem;" />
            <img :src="universiteParisCiteLogo" alt="Logo Université Paris Cité" style="height: 2.5rem;" />
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
        align-items: center;
        gap: 3rem;
    }
}
</style>
