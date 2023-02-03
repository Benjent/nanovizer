<template>
    <form class="l-form">
        <h1 class="title--1 l-form__title">NanoVizer</h1>
        <div class="l-form__input">
            <label class="data__label">File name</label>
            <input class="input data__value" v-model="fileName"/>
        </div>
        <p>
            <a class="link" @click="() => startNanoVizer(true)">Or try with showcase data</a>
        </p>

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
        </fieldset>

        <fieldset class="fieldset l-form__fieldset">
            <legend class="fieldset__legend">Filters (optional)</legend>
            <div class="l-form__input">
                <label class="data__label">Minimum read length</label>
                <input class="input input--pure data__value" type="number" v-model.number="minReadLength" min="0" />
            </div>
            <fieldset class="fieldset l-form__fieldset">
                <legend class="fieldset__legend">Position</legend>
                <div class="l-form__input">
                    <label class="data__label">3' minimum</label>
                    <input class="input input--pure data__value" type="number" v-model.number="minPosition3" min="0" />
                </div>
                <div class="l-form__input">
                    <label class="data__label">5' minimum</label>
                    <input class="input input--pure data__value" type="number" v-model.number="minPosition5" min="0" />
                </div>
                <div class="l-form__input">
                    <label class="data__label">5' maximum</label>
                    <input class="input input--pure data__value" type="number" v-model.number="maxPosition5" min="0" />
                </div>
            </fieldset>
        </fieldset>

        <div class="l-form__button">
            <Loader v-if="isLoading" />
            <button v-else class="button" :disabled="!isFormValid" type="button" @click="() => startNanoVizer(false)"><Icon icon="science" />&nbsp;Submit</button>
        </div>
        <p v-if="isError" class="l-form__error">
            An error occured during the process. Either the file is corrupted, misspelled or missing ; or we came across data that we couldn't parse.
        </p>
    </form>
</template>

<script lang="js">
import { mapActions, mapState, mapWritableState } from 'pinia'
import { useMainStore } from '../stores/main'
import Icon from './Icon.vue'
import Loader from './Loader.vue'

export default {
    components: {
        Icon,
        Loader,
    },
    computed: {
        ...mapState(useMainStore, ['nanoVizerData', 'isFileNameValid', 'isLoading', 'isError']),
        ...mapWritableState(useMainStore, ['fileName', 'genomeName', 'genomeSize', 'minReadLength', 'minPosition3', 'minPosition5', 'maxPosition5']),
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
        async startNanoVizer(isShowcase) {
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
    display: flex;
    flex-direction: column;
    align-items: center;
    background: var(--background-header);

    &__title {
        margin-bottom: 30px;
        padding-top: 6%;
    }

    &__input + &__input{
        margin-top: 20px;
    }

    &__input {
        text-align: right;
    }

    &__fieldset {
        width: fit-content;
        margin-top: 40px;
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
        color: var(--alert);
    }
}
</style>
