<template>
    <section class="entry">
        <h2 class="title title--2" id="summary">Summary</h2>
        <Failure v-if="!rawData">
            Missing data. Summary could not be shown.
        </Failure>
        <div v-else>
            <div class="data">
                <label class="data__label">Reads</label>
                <output class="data__value">{{rawData.total}}</output>
            </div>
            <div class="data">
                <label class="data__label">Host reads</label>
                <output class="data__value">TODO</output>
            </div>
            <div class="data">
                <label class="data__label">Viral reads for all genomes</label>
                <output class="data__value">TODO</output>
            </div>
            <br />
            <div class="data">
                <label class="data__label">Viral reads for a specific gene</label>
                <output class="data__value">TODO</output>
            </div>
            <div class="data">
                <label class="data__label">Viral single-block reads</label>
                <output class="data__value">TODO</output>
            </div>
            <div class="data">
                <label class="data__label">Viral multiple-block reads</label>
                <output class="data__value">TODO</output>
            </div>
            <br />
            <div class="data">
                <label class="data__label">Single-block reads</label>
                <output class="data__value">{{rawData.single_block}}</output>
            </div>
            <div class="data">
                <label class="data__label">Multiple-block reads</label>
                <output class="data__value">{{rawData.multiple_block}}</output>
            </div>
            <div class="data">
                <label class="data__label">Short Multiple-block reads</label>
                <output class="data__value">{{rawData.short_mutliple_block}}</output>
            </div>
            <div class="data">
                <label class="data__label">Reads too small</label>
                <output class="data__value">TODO</output>
            </div>
            <div class="data">
                <label class="data__label">Removed reads</label>
                <output class="data__value">{{rawData.removed}}</output>
            </div>
        </div>
    </section>
</template>

<script lang="js">
import { mapState } from 'pinia'
import { useMainStore } from '../stores/main'
import Failure from './Failure.vue'

export default {
    components: {
        Failure,
    },
    computed: {
        ...mapState(useMainStore, ['nanoVizerData']),
        rawData() {
            return this.nanoVizerData.read_summary_count
        },
    },
}
</script>
