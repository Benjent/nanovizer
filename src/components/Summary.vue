<template>
    <section class="entry">
        <h2 class="title title--2" id="summary">Summary</h2>
        <div>
            <div class="data">
                <label class="data__label">Reads</label>
                <output class="data__value">{{nanoVizerData.read_summary_count.total}}</output>
            </div>
            <div class="data">
                <label class="data__label">Host reads</label>
                <output class="data__value">TODO</output>
            </div>
            <br />
            <div class="data">
                <label class="data__label">Viral reads for all genomes</label>
                <output class="data__value">TODO</output>
            </div>
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
                <output class="data__value">{{nanoVizerData.read_summary_count.single_block}}</output>
            </div>
            <div class="data">
                <label class="data__label">Multiple-block reads</label>
                <output class="data__value">{{nanoVizerData.read_summary_count.multiple_block}}</output>
            </div>
            <div class="data">
                <label class="data__label">Short Multiple-block reads</label>
                <output class="data__value">{{nanoVizerData.read_summary_count.short_mutliple_block}}</output>
            </div>
            <br />
            <div class="data">
                <label class="data__label">Reads too small</label>
                <output class="data__value">TODO</output>
            </div>
            <div class="data">
                <label class="data__label">Removed reads</label>
                <output class="data__value">{{nanoVizerData.read_summary_count.removed}}</output>
            </div>
        </div>
    </section>
</template>

<script lang="js">
import { mapState } from 'pinia'
import { useMainStore } from '../stores/main'

export default {
    computed: {
        ...mapState(useMainStore, ['nanoVizerData']),
    },
}
</script>
