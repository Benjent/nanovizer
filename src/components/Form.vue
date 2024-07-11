<template>
    <form class="l-form">
        <h1 class="title--1 l-form__title">
            <img class="l-form__logo" :src="logo" alt="Logo NanoViZer" />
        </h1>

        <section class="l-form__inputs">
            <div>
                <div class="l-form__input">
                    <label class="data__label">File name</label>
                    <input class="input data__value" v-model="fileName"/>
                </div>
                <p>
                    <a class="link" @click="() => startNanoViZer(true)">Or try with showcase data</a>
                </p>
            </div>
            <fieldset class="fieldset l-form__fieldset">
                <legend class="fieldset__legend">Genome</legend>
                <!-- <div class="l-form__genomes">
                    <button class="button button--text" :disabled="!isFileNameValid" @click="getGenomes">List genomes from file</button>
                    <p class="helper" v-if="knownGenomes">Known genomes for this file: {{knownGenomes.join(', ')}}</p>
                </div> -->
                <div class="l-form__input">
                    <label class="data__label">Name</label>
                    <input class="input data__value" v-model="genomeName"/>
                </div>
                <div class="l-form__input">
                    <label class="data__label">Size</label>
                    <input class="input input--pure data__value" type="number" v-model.number="genomeSize" min="0" />
                </div>
                <div class="l-form__input">
                    <label class="data__label">File name (optional)</label>
                    <input class="input data__value" v-model="genomeFileName" />
                </div>
            </fieldset>
    
            <fieldset class="fieldset l-form__fieldset">
                <legend class="fieldset__legend">Filters (optional)</legend>
                <div class="l-form__input">
                    <label class="data__label">Minimum read length</label>
                    <input class="input input--pure data__value" type="number" v-model.number="minReadLength" min="0" />
                </div>
                <fieldset class="fieldset l-form__fieldset">
                    <legend class="fieldset__legend">Block position</legend>
                    <div class="l-form__input">
                        <label class="data__label">3' minimum</label>
                        <input class="input input--pure data__value" type="number" v-model.number="minBlockPosition3" min="0" />
                    </div>
                    <div class="l-form__input">
                        <label class="data__label">5' minimum</label>
                        <input class="input input--pure data__value" type="number" v-model.number="minBlockPosition5" min="0" />
                    </div>
                    <div class="l-form__input">
                        <label class="data__label">5' maximum</label>
                        <input class="input input--pure data__value" type="number" v-model.number="maxBlockPosition5" min="0" />
                    </div>
                </fieldset>
            </fieldset>
        </section>

        <div class="l-form__button">
            <Loader v-if="isLoading" />
            <button v-else class="button" :disabled="!isFormValid" type="button" @click="() => startNanoViZer(false)"><Icon icon="science" />&nbsp;Submit</button>
        </div>
        <Failure v-if="isError" class="l-form__error">
            An error occured during the process. Either the file is corrupted, misspelled or missing ; or we came across data that we couldn't parse.
        </Failure>
    </form>
</template>

<script lang="js">
import nanovizerDarkThemeLogo from '@/assets/images/logos/nanovizer-dark-theme.svg'
import nanovizerLightThemeLogo from '@/assets/images/logos/nanovizer-light-theme.svg'
import { mapActions, mapState, mapWritableState } from 'pinia'
import { useMainStore } from '../stores/main'
import Failure from './Failure.vue'
import Icon from './Icon.vue'
import Loader from './Loader.vue'

export default {
    components: {
        Failure,
        Icon,
        Loader,
    },
    data() {
        return {}
    },
    computed: {
        ...mapState(useMainStore, ['theme', 'nanoVizerData', 'isFileNameValid', 'isLoading', 'isError']),
        ...mapWritableState(useMainStore, ['fileName', 'genomeFileName', 'genomeName', 'genomeSize', 'minReadLength', 'minBlockPosition3', 'minBlockPosition5', 'maxBlockPosition5']),
        logo() {
            return this.theme === 'dark' ? nanovizerDarkThemeLogo : nanovizerLightThemeLogo
        },
        isFormValid() {
            return !this.isLoading
                // && !this.isLoadingGenomes
                && this.isFileNameValid
                && this.genomeName && this.genomeName.length !== 0
                && this.genomeSize
        },
        knownGenomes() {
            // if (this.isFileNameValid) {
            //     return JSON.parse(localStorage.getItem(this.fileName))
            // }
            return null
        },
    },
    methods: {
        ...mapActions(useMainStore, ['triggerParsing', 'useShowcaseData']),
        async startNanoViZer(isShowcase) {
            if (isShowcase) {
                await this.useShowcaseData()
            } else {
                await this.triggerParsing()
            }
        },
        // waitForD3Drawing() {
        //     setTimeout(() => {
        //         const header = document.querySelector('#header')
        //         this.headerHeightOffset = header.getBoundingClientRect().height
        //     }, 1000)
        // }
    }
}
</script>

<style lang="scss">
.l-form {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: var(--background-header);

    &__title {
        margin-bottom: 30px;
    }

    &__logo {
        width: 180px;
    }

    &__inputs {
        display: flex;
        gap: 20px;
        align-items: baseline;
        justify-content: center;
        flex-wrap: wrap;
    }

    &__input + &__input{
        margin-top: 20px;
    }

    &__input {
        text-align: right;
    }

    &__fieldset {
        width: fit-content;
    }

    &__genomes {
        display: flex;
        flex-direction: column;
        align-items: center;
        margin-bottom: 20px;
        text-align: center;
    }

    &__button {
        margin-top: 40px;
        display: flex;
        justify-content: center;
    }

    &__error {
        margin-top: 20px;
    }
}
</style>
