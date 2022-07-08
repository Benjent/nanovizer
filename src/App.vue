<script setup>
import axios from 'axios'
import showcaseResponse from './showcase-response.json'
import BarCode from './components/BarCode.vue'
import BlockNumber from './components/BlockNumber.vue'
import Junction from './components/Junction.vue'
import PairwiseJunctionSite from './components/PairwiseJunctionSite.vue'
import ReadLength from './components/ReadLength.vue'
import StartSitePosition from './components/StartSitePosition.vue'
</script>

<script>
export default {
    components: {
        BarCode,
        BlockNumber,
        Junction,
        PairwiseJunctionSite,
        ReadLength,
        StartSitePosition,
    },
    data() {
        return {
            email: 'benjent@hotmail.fr',
            fileName: '',
            nanoVizerData: undefined,
        }
    },
    methods: {
        triggerCorentin() {
            const path = 'http://localhost:5000/parse-file'
            const params = { fileName: this.fileName }
            axios.post(path, params)
            .then((response) => {
                console.log(response.data)
            })
            .catch((error) => {
                console.error(error)
            })
            .finally(() => {

            })
        },
        useShowcaseData() {
            console.log(showcaseResponse.data)
            this.nanoVizerData = showcaseResponse.data
        },
    }
}
</script>

<template>
    <div class="l-graphs">
        <header class="l-graphs__header">
            <div class="data">
                <label class="data__label">File name</label>
                <input class="input data__value" v-model="fileName"/>
            </div>
            <button class="button l-graphs__header__button" :disabled="!fileName || fileName.length === 0" @click="triggerCorentin">Submit</button>
            <button class="button l-graphs__header__button" @click="useShowcaseData">Try with showcase data</button>
        </header>
        <main>
            <ReadLength :data="nanoVizerData?.size" />
            <BlockNumber :data="nanoVizerData?.block_number" />
            <StartSitePosition :data="nanoVizerData?.start_site" />
            <Junction :data="nanoVizerData?.['3_prime']" :type="3"/>
            <Junction :data="nanoVizerData?.['5_prime']" :type="5"/>
            <PairwiseJunctionSite :data="nanoVizerData?.junction" />
            <BarCode  :data="nanoVizerData?.barcode" />
        </main>
        <footer class="l-graphs__footer">
            Like this webapp? Have a feedback? Give me a shout at {{email}}!
        </footer>
    </div>
</template>

<style lang="scss">
@import './assets/styles/main.scss';
@import './assets/base.css'; // TODO refact

.l-graphs {
    @include theme;
    margin: 0 auto;
    width: 100%;
    text-align: center;
    font-weight: normal;

    &__header {
        position: sticky;
        z-index: 1;
        top: 0;
        background: darken($marine, 4%);
        padding: var(--button-padding-v) var(--button-padding-h);
        display: flex;
        justify-content: center;

        &__button {
            margin-left: 20px;
        }
    }

    &__footer {
        padding: var(--button-padding-v) var(--button-padding-h);
        background: lighten($marine, 10%);
        font-size: 0.8rem;
    }
}
</style>
