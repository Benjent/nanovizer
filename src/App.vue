<script setup>
import axios from 'axios'
import showcaseResponse from './showcase-response.json'
import Barcode from './components/Barcode.vue'
import BlockCount from './components/BlockCount.vue'
import Position from './components/Position.vue'
import Junction from './components/Junction.vue'
import Size from './components/Size.vue'
import StartSite from './components/StartSite.vue'
import Summary from './components/Summary.vue'
import logoCnrs from './assets/images/logos/cnrs.svg'
import logoInserm from './assets/images/logos/inserm.svg'
import logoInstitutCochin from './assets/images/logos/institut-cochin.svg'
import logoUniversiteParisCite from './assets/images/logos/universite-paris-cite.svg'
</script>

<script>
export default {
    components: {
        Barcode,
        BlockCount,
        Junction,
        Position,
        Size,
        StartSite,
        Summary,
    },
    data() {
        return {
            email: 'benjent@hotmail.fr',
            fileName: '',
            isFileLoaded: false,
            nanoVizerData: undefined,
            nav: [
                { title: 'Size', to: 'size' },
                { title: 'Block count', to: 'blockCount' },
                { title: 'Start site', to: 'startSite' },
                { title: '3\' Position', to: 'position3' },
                { title: '5\' Position', to: 'position5' },
                { title: 'Junction', to: 'junction' },
                { title: 'Barcode', to: 'barcode' },
                { title: 'Summary', to: 'summary' },
            ],
            scrollPosition: 0,
        }
    },
    computed: {
        activeNavItem() {
            let highlightedNavItem = this.nav[0].to
            this.nav.forEach((item) => {
                const navItemScrollPosition = document.getElementById(item.to).offsetTop
                const headerHeightOffset = 200
                if (this.scrollPosition + headerHeightOffset > navItemScrollPosition) {
                    highlightedNavItem = item.to
                }
            })
            return highlightedNavItem
        },
    },
    mounted() {
        window.addEventListener('scroll', this.updateScrollPosition)
    },
    unmounted() {
        window.removeEventListener('scroll', this.updateScrollPosition)
    },
    methods: {
        scrollTo(to) {
            const element = document.getElementById(to)
            const headerHeightOffset = 200
            window.scrollTo({ top: element.offsetTop - headerHeightOffset, behavior: "smooth" })
        },
        setNanovizerData(data) {
            this.nanoVizerData = data
            this.isFileLoaded = true
        },
        startAgain() {
            this.isFileLoaded = false
            this.fileName = ''
            this.nanoVizerData = undefined
            window.scrollTo(0, 0)
        },
        triggerParsing() {
            const path = 'http://localhost:5000/parse-file'
            const params = { fileName: this.fileName }
            axios.post(path, params)
            .then((response) => {
                this.setNanovizerData(response.data)
            })
            .catch((error) => {
                console.error(error)
            })
        },
        updateScrollPosition() {
            this.scrollPosition = window.scrollY
        },
        useShowcaseData() {
            this.fileName = 'showcase'
            this.setNanovizerData(showcaseResponse.data)
        },
    }
}
</script>

<template>
    <div class="l-graphs">
        <header class="l-graphs__header" :class="{ 'l-graphs__header--overlay': !isFileLoaded }">
            <template v-if="isFileLoaded">
                <h1 class="title--1 data__value">{{fileName}}</h1>
                <a class="link" @click="startAgain">Make another analysis</a>
                <nav class="l-graphs__header__nav">
                    <span class="l-graphs__header__nav__filler"></span>
                    <a
                        class="l-graphs__header__nav__item"
                        :class="{ 'l-graphs__header__nav__item--active': activeNavItem === item.to }"
                        v-for="item in nav" :key="item.to"
                        @click="scrollTo(item.to)">
                        {{item.title}}
                    </a>
                    <span class="l-graphs__header__nav__filler"></span>
                </nav>
            </template>
            <section class="l-graphs__header__inputs" v-else>
                <div class="data l-graphs__header__file">
                    <h1 class="title--1 l-graphs__header__title">Genome analyzer</h1>
                    <div class="l-graphs__header__input">
                        <label class="data__label">File name</label>
                        <input class="input data__value" v-model="fileName"/>
                        <button class="button l-graphs__header__button" :disabled="!fileName || fileName.length === 0" @click="triggerParsing">Submit</button>
                    </div>
                    <a class="link l-graphs__header__try" @click="useShowcaseData">Or try with showcase data</a>
                </div>
            </section>
            
        </header>
        <main class="l-graphs__main">
            <Size :data="nanoVizerData?.read_size" />
            <BlockCount :data="nanoVizerData?.block_count" />
            <StartSite :data="nanoVizerData?.start_site_count" />
            <Position :data="nanoVizerData?.['3_prime_count']" :type="3"/>
            <Position :data="nanoVizerData?.['5_prime_count']" :type="5"/>
            <Junction :data="nanoVizerData?.junction_count" />
            <Barcode :data="nanoVizerData?.barcode_count" />
            <Summary :data="nanoVizerData?.read_summary_count" />
        </main>
        <footer class="l-graphs__footer">
            <p class="l-graphs__footer__feedback">
                Like this webapp? Have a feedback? Give me a shout at {{email}}!
            </p>
            <div class="l-graphs__footer__logos">
                <img :src="logoCnrs" alt="Logo CNRS" />
                <img :src="logoInserm" alt="Logo Inserm" />
                <img :src="logoInstitutCochin" alt="Logo Institut Cochin" />
                <img :src="logoUniversiteParisCite" alt="Logo Université Paris Cité" />
            </div>
        </footer>
    </div>
</template>

<style lang="scss">
@import './assets/styles/main.scss';

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
        height: 170px;
        transition: height 1s;

        &--overlay {
            height: 100vh;
        }

        &__title {
            margin-bottom: 30px;
        }

        &__inputs {
            display: flex;
            justify-content: center;
            height: 100%;
            align-items: center;
        }

        &__file {
            display: flex;
            flex-direction: column;
            margin-bottom: 40px;
        }

        &__try {
            font-size: 0.8rem;
            margin-right: 32px; // Align with input by setting a margin whose width is label width
        }

        &__button {
            margin-left: 20px;
        }

        &__nav {
            display: flex;
            justify-content: center;
            margin-top: 20px;

            &__item {
                padding: 10px 20px;
                cursor: pointer;
                border-bottom: solid 2px transparent;
                border-bottom-color: lighten($marine, 20%);

                &:hover:not(.l-graphs__header__nav__item--active) {
                    background: $marine;
                }

                &--active {
                    background: lighten($marine, 20%);
                    border-bottom-color: transparent;
                }
            }

            &__filler {
                flex: 1;
                border-bottom: solid 2px lighten($marine, 20%);
            }
        }
    }

    &__main {
        min-height: 80vh;
    }

    &__footer {
        padding: 20px 60px;
        background: lighten($marine, 10%);

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
}
</style>
