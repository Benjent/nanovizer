<template>
    <div class="l-graphs">
        <template v-if="nanoVizerData">
            <Header />
            <main class="l-graphs__main">
                <Size />
                <BlockCount />
                <StartSite />
                <Position :type="3" />
                <Position :type="5" />
                <Junction />
                <Barcode />
                <Summary />
            </main>
            <Footer />
        </template>
        <Form v-else />
        <ThemeSwitch />
    </div>
</template>

<script>
import { mapState } from 'pinia'
import { useMainStore } from './stores/main'
import Barcode from './components/Barcode.vue'
import BlockCount from './components/BlockCount.vue'
import Footer from './components/Footer.vue'
import Form from './components/Form.vue'
import Header from './components/Header.vue'
import Junction from './components/Junction.vue'
import Position from './components/Position.vue'
import Size from './components/Size.vue'
import StartSite from './components/StartSite.vue'
import Summary from './components/Summary.vue'
import ThemeSwitch from './components/ThemeSwitch.vue'

export default {
    components: {
        Barcode,
        BlockCount,
        Footer,
        Form,
        Header,
        Junction,
        Position,
        Size,
        StartSite,
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

.l-graphs {
    @include theme;
    margin: 0 auto;
    width: 100%;
    text-align: center;
    font-weight: normal;
    background: var(--background);

    &__header {
        display: flex;
        align-items: end;
        position: sticky;
        z-index: 1;
        top: 0;
        background: var(--background-header);
    }

    &__main {
        min-height: 80vh;
    }
}
</style>
