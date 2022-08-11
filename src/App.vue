<script setup>
import axios from './libs/axios'
import showcaseSmall from './showcase/showcase-hdv.json'
import showcaseBig from './showcase/showcase-sars.json'
import Barcode from './components/Barcode.vue'
import BlockCount from './components/BlockCount.vue'
import Footer from './components/Footer.vue'
import Icon from './components/Icon.vue'
import Junction from './components/Junction.vue'
import Loader from './components/Loader.vue'
import Position from './components/Position.vue'
import Size from './components/Size.vue'
import StartSite from './components/StartSite.vue'
import Summary from './components/Summary.vue'
</script>

<script>
export default {
    components: {
        Barcode,
        BlockCount,
        Footer,
        Icon,
        Junction,
        Loader,
        Position,
        Size,
        StartSite,
        Summary,
    },
    data() {
        return {
            fileName: '',
            genomeName: '',
            genomeSize: undefined,
            minPosition3: undefined,
            minPosition5: undefined,
            maxPosition5: undefined,
            headerHeightOffset: 190, // Ugly
            isFileLoaded: false,
            isLoading: false,
            isLoadingGenomes: false,
            isError: false,
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
            themeIcon: 'light_mode',
            themeText: 'Light theme',
        }
    },
    computed: {
        activeNavItem() {
            if (document.body.clientHeight - window.innerHeight === this.scrollPosition) {
                return this.nav[this.nav.length - 1].to
            }

            let highlightedNavItem =  this.nav[0].to
            this.nav.forEach((item) => {
                const navItemTargetElement = document.getElementById(item.to)
                if (navItemTargetElement) {
                    const navItemScrollPosition = navItemTargetElement.offsetTop
                    if (this.scrollPosition + this.headerHeightOffset + 100 > navItemScrollPosition) {
                        highlightedNavItem = item.to
                    }
                }
            })

            return highlightedNavItem
        },
        isFileNameValid() {
            return this.fileName && this.fileName.length !== 0
        },
        isFormValid() {
            return !this.isLoading && !this.isLoadingGenomes
                && this.isFileNameValid
                && this.genomeName && this.genomeName.length !== 0
                && this.genomeSize
        },
        knownGenomes() {
            if (this.isFileNameValid) {
                return JSON.parse(localStorage.getItem(this.fileName))
            }
            return null
        },
    },
    mounted() {
        window.addEventListener('scroll', this.updateScrollPosition)
    },
    unmounted() {
        window.removeEventListener('scroll', this.updateScrollPosition)
    },
    methods: {
        getGenomes() {
            this.isLoadingGenomes = true

            axios.get('/genomes')
            .then((response) => {
                localStorage.setItem(this.fileName, JSON.stringify(response.data))
            })
            .catch((error) => {
                console.error(error)
                this.isError = true
            })
            .finally(() => {
                this.isLoadingGenomes = false
            })
        },
        scrollTo(to) {
            const element = document.getElementById(to)
            const niceOffset = 20
            const top = to === this.nav[0].to ? 0 : element.offsetTop - this.headerHeightOffset - niceOffset
            window.scrollTo({ top, behavior: "smooth" })
        },
        setNanovizerData(data) {
            this.nanoVizerData = data
            this.isLoading = false
            this.isFileLoaded = true

            setTimeout(() => {
                const header = document.querySelector('#header')
                this.headerHeightOffset = header.getBoundingClientRect().height
            }, 1001)
        },
        startAgain() {
            this.isFileLoaded = false
            this.nanoVizerData = undefined
            window.scrollTo(0, 0)
        },
        toggleTheme() {
            document.body.classList.toggle("light")
            this.themeIcon = document.body.classList.contains("light") ? 'dark_mode' : 'light_mode'
            this.themeText = document.body.classList.contains("light") ? 'Dark theme' : 'Light theme'
        },
        triggerParsing() {
            this.isLoading = true
            this.isError = false

            const params = {
                file_name: this.fileName,
                genome_name: this.genomeName,
                genome_size: this.genomeSize,
                min_position_3: this.minPosition3,
                min_position_5: this.minPosition5,
                max_position_5: this.maxPosition5,
            }

            axios.post('/parse-file', params)
            .then((response) => {
                this.setNanovizerData(response.data)
            })
            .catch((error) => {
                console.error(error)
                this.isError = true
            })
            .finally(() => {
                this.isLoading = false
            })
        },
        updateScrollPosition() {
            this.scrollPosition = window.scrollY
        },
        useShowcaseData() {
            const isShowcaseBig = false && Math.random() < 0.5
            const showcaseResponse = isShowcaseBig ? showcaseBig : showcaseSmall

            this.isLoading = true
            this.isError = false
            this.fileName = isShowcaseBig ? 'showcase_big' : 'showcase_small'
            this.genomeName = 'genome'
            this.genomeSize = isShowcaseBig ? 30000 : 2000
            this.minPosition3 = undefined
            this.minPosition5 = undefined
            this.maxPosition5 = undefined

            setTimeout(() => {
                // Force loading rendering before drawing charts
                this.setNanovizerData(showcaseResponse.data)
            }, 1)
        },
    }
}
</script>

<template>
    <div class="l-graphs">
        <header id="header" class="l-graphs__header" :class="{ 'l-graphs__header--overlay': !isFileLoaded }">
            <template v-if="isFileLoaded">
                <div class="l-graphs__header__titles">
                    <h2 class="title title--2 title--marginless data__value">{{fileName}}</h2>
                    <h3 class="title title--4 title--marginless">{{genomeName}} ({{genomeSize}})</h3>
                    <a class="link" @click="startAgain">Make another analysis</a>
                </div>
                <nav class="l-graphs__header__nav">
                    <span class="l-graphs__header__nav__filler"></span>
                    <a
                        class="tab"
                        :class="{ 'tab--active': activeNavItem === item.to }"
                        v-for="item in nav" :key="item.to"
                        @click="scrollTo(item.to)">
                        {{item.title}}
                    </a>
                    <span class="l-graphs__header__nav__filler"></span>
                </nav>
                <div class="l-graphs__header__titles"></div>
            </template>
            <template v-else>
                <h1 class="title--1 l-graphs__header__title">NanoVizer</h1>
                    <form class="l-graphs__header__form">
                        <div class="l-graphs__header__form__input">
                            <label class="data__label">File name</label>
                            <input class="input data__value" v-model="fileName"/>
                        </div>
                        <p>
                            <a class="link" @click="useShowcaseData">Or try with showcase data</a>
                        </p>

                        <fieldset class="fieldset l-graphs__header__form__fieldset">
                            <legend class="fieldset__legend">Genome</legend>
                            <div class="l-graphs__header__genomes">
                                <Loader v-if="isLoadingGenomes" />
                                <template v-else>
                                    <button class="button button--text" :disabled="!isFileNameValid" @click="getGenomes">List genomes from file</button>
                                    <p class="helper" v-if="knownGenomes">Known genomes for this file: {{knownGenomes.join(', ')}}</p>
                                </template>
                            </div>
                            <div class="l-graphs__header__form__input">
                                <label class="data__label">Name</label>
                                <input class="input data__value" v-model="genomeName"/>
                            </div>
                            <div class="l-graphs__header__form__input">
                                <label class="data__label">Size</label>
                                <input class="input input--pure data__value" type="number" v-model.number="genomeSize" min="0" />
                            </div>
                        </fieldset>

                        <fieldset class="fieldset l-graphs__header__form__fieldset">
                            <legend class="fieldset__legend">Position (optional)</legend>
                            <div class="l-graphs__header__form__input">
                                <label class="data__label">3' minimum</label>
                                <input class="input input--pure data__value" type="number" v-model.number="minPosition3" min="0" />
                            </div>
                            <div class="l-graphs__header__form__input">
                                <label class="data__label">5' minimum</label>
                                <input class="input input--pure data__value" type="number" v-model.number="minPosition5" min="0" />
                            </div>
                            <div class="l-graphs__header__form__input">
                                <label class="data__label">5' maximum</label>
                                <input class="input input--pure data__value" type="number" v-model.number="maxPosition5" min="0" />
                            </div>
                        </fieldset>

                        <div class="l-graphs__header__button">
                            <Loader v-if="isLoading" />
                            <button v-else class="button" :disabled="!isFormValid" type="button" @click="triggerParsing"><Icon icon="science" />&nbsp;Submit</button>
                        </div>
                    </form>
                    <p v-if="isError" class="l-graphs__header__error">
                        An error occured during the process. Either the file is corrupted, misspelled or missing ; or we came across data that we couldn't parse.
                    </p>
            </template>
            <button class="button button--text l-graphs__header__switch-theme" @click="toggleTheme">
                <Icon :icon="themeIcon" />&nbsp;{{themeText}}
            </button>
        </header>
        <main class="l-graphs__main">
            <Size :data="nanoVizerData?.read_size" />
            <BlockCount :data="nanoVizerData?.block_count" />
            <StartSite :data="nanoVizerData?.start_site_count" :genome-size="genomeSize" />
            <Position :data="nanoVizerData?.['3_prime_count']" :type="3" :genome-size="genomeSize" />
            <Position :data="nanoVizerData?.['5_prime_count']" :type="5" :genome-size="genomeSize" />
            <Junction :data="nanoVizerData?.junction_count" :genome-size="genomeSize" />
            <Barcode :data="nanoVizerData?.barcode_count" :genome-size="genomeSize" />
            <Summary :data="nanoVizerData?.read_summary_count" />
        </main>
        <Footer />
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
        display: flex;
        align-items: end;
        position: sticky;
        z-index: 1;
        top: 0;
        background: var(--background-header);
        border-bottom: solid 2px var(--tab-background-active);

        &--overlay {
            display: block;
            height: 100vh;
            border-color: var(--background-header);
            box-sizing: border-box;
        }

        &__switch-theme {
            position: absolute;
            top: 20px;
            right: 20px;
            font-size: 0.8rem;
        }

        &__titles {
            flex: 1;
            padding: 10px 20px;
        }

        &__title {
            margin-bottom: 30px;
            padding-top: 6%;
        }

        &__form {
            margin: auto;
            width: fit-content;
            display: flex;
            flex-direction: column;
            align-items: center;

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
        }

        &__file {
            display: flex;
            flex-direction: column;
            margin-bottom: 100px;
        }

        &__button {
            margin-top: 40px;
            display: flex;
            justify-content: center;
        }

        &__nav {
            display: flex;
            justify-content: center;
            margin-top: 20px;

            &__filler {
                flex: 1;
            }
        }

        &__genomes {
            display: flex;
            flex-direction: column;
            align-items: center;
            margin-bottom: 20px;
            text-align: center;
        }

        &__error {
            margin-top: 20px;
            color: var(--alert);
        }
    }

    &__main {
        min-height: 80vh;
    }
}
</style>
