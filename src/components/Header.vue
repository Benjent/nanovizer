<template>
    <header id="header" class="l-header">
        <div class="l-header__titles">
            <h2 class="title title--2 title--marginless data__value l-header__titles__file-name">{{fileName}}</h2>
            <h3 class="title title--4 title--marginless">{{genomeName}} ({{genomeSize}})</h3>
            <a class="link" @click="startAgain">Make another analysis</a>
        </div>
        <nav class="l-header__nav">
            <span class="l-header__nav__filler"></span>
            <a
                class="tab"
                :class="{ 'tab--active': activeNavItem === item.to }"
                v-for="item in nav" :key="item.to"
                @click="scrollTo(item.to)">
                {{item.title}}
            </a>
            <span class="l-header__nav__filler"></span>
        </nav>
        <div class="l-header__titles"></div>
    </header>
</template>

<script lang="js">
import { mapActions, mapState } from 'pinia'
import { useMainStore } from '../stores/main'

export default {
    data() {
        return {
            headerHeightOffset: 100, // Ugly
            nav: [
                { title: 'Summary', to: 'summary' },
                { title: 'Size', to: 'size' },
                { title: 'One block coverage', to: 'oneBlockCoverage' },
                { title: 'Block count', to: 'blockCount' },
                { title: 'Start site', to: 'startSite' },
                { title: 'End site', to: 'endSite' },
                { title: '3\' Block position', to: 'blockPosition3' },
                { title: '5\' Block position', to: 'blockPosition5' },
                { title: 'Junction', to: 'junction' },
                { title: 'Barcode', to: 'barcode' },
            ],
            scrollPosition: 0,
        }
    },
    computed: {
        ...mapState(useMainStore, ['fileName', 'genomeName', 'genomeSize']),
        activeNavItem() {
            // Hack to bypass wrong document.body.clientHeight value before first scroll
            if (this.scrollPosition === 0) {
                return this.nav[0].to
            }

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
    },
    mounted() {
        window.addEventListener('scroll', this.updateScrollPosition)
    },
    unmounted() {
        window.removeEventListener('scroll', this.updateScrollPosition)
    },
    methods: {
        ...mapActions(useMainStore, ['startAgain']),
        scrollTo(to) {
            const element = document.getElementById(to)
            const niceOffset = 20
            const top = to === this.nav[0].to ? 0 : element.offsetTop - this.headerHeightOffset - niceOffset
            window.scrollTo({ top, behavior: "smooth" })
        },
        updateScrollPosition() {
            this.scrollPosition = window.scrollY
        },
        // TODO one nanoVIzerData is set, call below
        // const header = document.querySelector('#header')
    //             this.headerHeightOffset = header.getBoundingClientRect().height
    }
}
</script>

<style lang="scss">
.l-header {
    display: flex;
    align-items: end;
    position: sticky;
    width: 100%;
    z-index: 1;
    top: 0;
    background: var(--background-header);
    border-bottom: solid 2px var(--tab-background-active);

    &__titles {
        flex: 1;
        padding: 10px 20px;

        & &__file-name {
            max-width: 300px;
            overflow: hidden;
            text-overflow: ellipsis;
            text-align: center;
            margin: auto;
        }
    }

    &__nav {
        display: flex;
        justify-content: center;
        margin-top: 20px;

        &__filler {
            flex: 1;
        }
    }
}
</style>
