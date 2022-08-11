<script setup>
import logoCnrs from '../assets/images/logos/cnrs.svg'
import logoInserm from '../assets/images/logos/inserm.svg'
import logoInstitutCochin from '../assets/images/logos/institut-cochin.svg'
import logoUniversiteParisCite from '../assets/images/logos/universite-paris-cite.svg'
</script>

<script>
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
            <img :src="logoCnrs" alt="Logo CNRS" />
            <img :src="logoInserm" alt="Logo Inserm" />
            <img :src="logoInstitutCochin" alt="Logo Institut Cochin" />
            <img :src="logoUniversiteParisCite" alt="Logo Université Paris Cité" />
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
