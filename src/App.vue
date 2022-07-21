<script setup>
import axios from './libs/axios'
import showcaseResponse from './showcase-response.json'
import Barcode from './components/Barcode.vue'
import BlockCount from './components/BlockCount.vue'
import Position from './components/Position.vue'
import Icon from './components/Icon.vue'
import Junction from './components/Junction.vue'
import Loader from './components/Loader.vue'
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
            email: 'benjent@hotmail.fr',
            fileName: '',
            genomeName: '',
            genomeSize: undefined,
            minPosition3: undefined,
            minPosition5: undefined,
            maxPosition5: undefined,
            headerHeightOffset: 190, // Ugly
            isFileLoaded: false,
            isLoading: false,
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
        }
    },
    computed: {
        activeNavItem() {
            if (document.body.clientHeight - window.innerHeight === this.scrollPosition) {
                return this.nav[this.nav.length - 1].to
            }

            let highlightedNavItem =  this.nav[0].to
            this.nav.forEach((item) => {
                const navItemScrollPosition = document.getElementById(item.to).offsetTop
                if (this.scrollPosition + this.headerHeightOffset + 100 > navItemScrollPosition) {
                    highlightedNavItem = item.to
                }
            })

            return highlightedNavItem
        },
        isFormValid() {
            return !this.isLoading
                && this.fileName && this.fileName.length !== 0
                && this.genomeName && this.genomeName.length !== 0
                && this.genomeSize
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
            this.isLoading = true
            this.isError = false
            this.fileName = 'showcase'
            this.genomeName = 'genome'
            this.genomeSize = 30000
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
                    <h1 class="title title--1 title--marginless data__value">{{fileName}}</h1>
                    <h2 class="title title--4 title--marginless">{{genomeName}} ({{genomeSize}})</h2>
                    <a class="link" @click="startAgain">Make another analysis</a>
                </div>
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
                <div class="l-graphs__header__titles"></div>
            </template>
            <template v-else>
                <h1 class="title--1 l-graphs__header__title">NanoVizer</h1>
                    <form class="l-graphs__header__form">
                        <div class="l-graphs__header__form__input">
                            <label class="data__label">File name</label>
                            <input class="input data__value" v-model="fileName"/>
                        </div>
                        <a class="link l-graphs__header__try" @click="useShowcaseData">Or try with showcase data</a>
                        <div class="l-graphs__header__form__input">
                            <label class="data__label">Genome name</label>
                            <input class="input data__value" v-model="genomeName"/>
                        </div>
                        <div class="l-graphs__header__form__input">
                            <label class="data__label">Genome size</label>
                            <input class="input data__value" type="number" v-model.number="genomeSize" min="0" />
                        </div>
                        <fieldset class="fieldset fieldset--overflow l-graphs__header__form__fieldset">
                            <legend class="fieldset__legend">Position (optional)</legend>
                            <div class="l-graphs__header__form__input">
                                <label class="data__label">3' minimum position</label>
                                <input class="input data__value" v-model="minPosition3"/>
                            </div>
                            <div class="l-graphs__header__form__input">
                                <label class="data__label">5' minimum position</label>
                                <input class="input data__value" v-model="minPosition5"/>
                            </div>
                            <div class="l-graphs__header__form__input">
                                <label class="data__label">5' maximum position</label>
                                <input class="input data__value" v-model="maxPosition5"/>
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
            <button class="button button--transparent l-graphs__header__switch-theme" @click="toggleTheme">
                <Icon :icon="themeIcon" />
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
        display: flex;
        align-items: end;
        position: sticky;
        z-index: 1;
        top: 0;
        background: var(--background-dark);
        border-bottom: solid 2px var(--background-ultralight);

        &--overlay {
            display: block;
            height: 100vh;
            border-color: var(--background-dark);
            box-sizing: border-box;
        }

        &__switch-theme {
            position: absolute;
            top: 20px;
            right: 20px;
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

        &__try {
            font-size: 0.8rem;
            margin-left: 120px; // Ugly fake align
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

            &__item {
                padding: 10px 20px;
                cursor: pointer;
                // border-bottom: solid 2px transparent;
                // border-bottom-color: var(--background-ultralight);
                transition: all 0.2s;

                &:hover:not(.l-graphs__header__nav__item--active) {
                    background: var(--background);
                }

                &--active {
                    background: var(--background-ultralight);
                    // border-bottom-color: transparent;
                }
            }

            &__filler {
                flex: 1;
                // border-bottom: solid 2px var(--background-ultralight);
            }
        }

        &__error {
            margin-top: 20px;
            color: var(--alert);
        }
    }

    &__main {
        min-height: 80vh;
    }

    &__footer {
        padding: 20px 60px;
        background: var(--background-light);

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
