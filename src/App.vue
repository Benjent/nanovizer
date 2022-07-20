<script setup>
import axios from './libs/axios'
import showcaseResponse from './showcase-response.json'
import Barcode from './components/Barcode.vue'
import BlockCount from './components/BlockCount.vue'
import Position from './components/Position.vue'
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
            headerHeightOffset: 200, // Ugly
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
                if (this.scrollPosition + this.headerHeightOffset + 1 > navItemScrollPosition) {
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
        }
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
            this.isLoading = false
            this.isFileLoaded = true
        },
        startAgain() {
            this.isFileLoaded = false
            this.fileName = ''
            this.nanoVizerData = undefined
            window.scrollTo(0, 0)
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
            this.genomeName = ''
            this.genomeSize = undefined
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
        <header class="l-graphs__header" :class="{ 'l-graphs__header--overlay': !isFileLoaded }">
            <section v-if="isFileLoaded">
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
            </section>
            <section class="l-graphs__header__landing" v-else>
                <h1 class="title--1 l-graphs__header__title">NanoVizer</h1>
                    <form class="l-graphs__header__landing__form">
                        <div class="l-graphs__header__landing__form__input">
                            <label class="data__label">File name</label>
                            <input class="input data__value" v-model="fileName"/>
                        </div>
                        <a class="link l-graphs__header__try" @click="useShowcaseData">Or try with showcase data</a>
                        <div class="l-graphs__header__landing__form__input">
                            <label class="data__label">Genome name</label>
                            <input class="input data__value" v-model="genomeName"/>
                        </div>
                        <div class="l-graphs__header__landing__form__input">
                            <label class="data__label">Genome size</label>
                            <input class="input data__value" type="number" v-model.number="genomeSize" min="0" />
                        </div>
                        <fieldset class="fieldset fieldset--overflow l-graphs__header__landing__form__fieldset">
                            <legend class="fieldset__legend">Position (optional)</legend>
                            <div class="l-graphs__header__landing__form__input">
                                <label class="data__label">3' minimum position</label>
                                <input class="input data__value" v-model="minPosition3"/>
                            </div>
                            <div class="l-graphs__header__landing__form__input">
                                <label class="data__label">5' minimum position</label>
                                <input class="input data__value" v-model="minPosition5"/>
                            </div>
                            <div class="l-graphs__header__landing__form__input">
                                <label class="data__label">5' maximum position</label>
                                <input class="input data__value" v-model="maxPosition5"/>
                            </div>
                        </fieldset>
                        <div class="l-graphs__header__button">
                            <Loader v-if="isLoading" />
                            <button v-else class="button" :disabled="!isFormValid" type="button" @click="triggerParsing">Submit</button>
                        </div>
                    </form>
                    <p v-if="isError" class="l-graphs__header__error">
                        An error occured during the process. Either the file is corrupted, misspelled or missing ; or we came across data that we couldn't parse.
                    </p>
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
            padding-top: 6%;
        }

        &__landing {
            height: 100%;

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
        }

        &__file {
            display: flex;
            flex-direction: column;
            margin-bottom: 100px;
        }

        &__try {
            font-size: 0.8rem;
            margin-left: 100px; // Ugly fake align
        }

        &__button {
            margin-top: 40px;
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

        &__error {
            margin-top: 20px;
            color: $alert;
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
