<template>
    <div class="l-nanovizer">
        <template v-if="nanoVizerData">
            <Header />
            <main class="l-nanovizer__main">
                <Summary />
                <Size />
                <OneBlockCoverage />
                <BlockCount />
                <Site type="start" />
                <Site type="end" />
                <BlockPosition :type="3" />
                <BlockPosition :type="5" />
                <Junction />
                <Barcode />
            </main>
            <Footer />
        </template>
        <Form v-else />
        <div class="l-nanovizer__switches">
            <ThemeSwitch />
            <ContrastSwitch />
        </div>
    </div>
</template>

<script lang="js">
import { mapState } from 'pinia'
import { useMainStore } from './stores/main'
import Barcode from './components/Barcode.vue'
import BlockCount from './components/BlockCount.vue'
import BlockPosition from './components/BlockPosition.vue'
import ContrastSwitch from './components/ContrastSwitch.vue'
import Footer from './components/Footer.vue'
import Form from './components/Form.vue'
import Header from './components/Header.vue'
import Junction from './components/Junction.vue'
import OneBlockCoverage from './components/OneBlockCoverage.vue'
import Site from './components/Site.vue'
import Size from './components/Size.vue'
import Summary from './components/Summary.vue'
import ThemeSwitch from './components/ThemeSwitch.vue'

export default {
    components: {
        Barcode,
        BlockCount,
        BlockPosition,
        ContrastSwitch,
        Footer,
        Form,
        Header,
        Junction,
        OneBlockCoverage,
        Site,
        Size,
        Summary,
        ThemeSwitch,
    },
    computed: {
        ...mapState(useMainStore, ['nanoVizerData']),
    }
}
</script>

<style lang="scss">
@import './assets/styles/main.scss';

html {
    // Prevent white background on webap load
    background: var(--background);
}

.l-nanovizer {
    @include theme;
    display: flex;
    flex-direction: column;
    min-height: 100svh;
    margin: 0 auto;
    width: 100%;
    text-align: center;
    font-weight: normal;
    background: var(--background);

    &__switches {
        display: flex;
        position: fixed;
        top: 10px;
        right: 10px;
        z-index: 1;
        font-size: 0.8rem;
    }

    &__main {
        min-height: 80vh;
    }
}
</style>
