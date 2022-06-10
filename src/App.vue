<script setup>
import axios from 'axios'
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
        }
    },
    created() {
        this.triggerCorentin()
    },
    methods: {
        triggerCorentin() {
            // const path = 'http://localhost:5000/hello'
            const path = 'http://localhost:5000/test/read-length'
            axios.get(path)
            .then((response) => {
                console.log(response.data)
            })
            .catch((error) => {
                console.error(error)
            })
        },
    }
}
</script>

<template>
    <div class="l-graphs">
        <main>
            <ReadLength />
            <BlockNumber />
            <StartSitePosition />
            <Junction :type="3"/>
            <Junction :type="5"/>
            <PairwiseJunctionSite />
            <BarCode />
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

    &__footer {
        padding: var(--button-padding-v) var(--button-padding-h);
        background: lighten($marine, 10%);
        font-size: 0.8rem;
    }
}
</style>
