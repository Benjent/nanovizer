<template>
    <section class="entry">
        <h2 class="title title--2" id="summary">Summary</h2>
        <div>
            <div class="data">
                <label class="data__label">Total number of reads</label>
                <output class="data__value">{{nanoVizerData.read_summary_count.total}}</output>
            </div>
            <div class="data">
                <label class="data__label">Number of reads with single blocks</label>
                <output class="data__value">{{nanoVizerData.read_summary_count.single_block}}</output>
            </div>
            <div class="data">
                <label class="data__label">Number of reads with multiple blocks</label>
                <output class="data__value">{{nanoVizerData.read_summary_count.multiple_block}}</output>
            </div>
            <div class="data">
                <label class="data__label">Number of short reads with multiple blocks</label>
                <output class="data__value">{{nanoVizerData.read_summary_count.short_mutliple_block}}</output>
            </div>
            <div class="data">
                <label class="data__label">Number of removed reads</label>
                <output class="data__value">{{nanoVizerData.read_summary_count.removed}}</output>
            </div>
        </div>
    </section>
</template>

<script>
import { mapState } from 'pinia'
import { useMainStore } from '../stores/main'

export default {
    computed: {
        ...mapState(useMainStore, ['nanoVizerData']),
    },
}
</script>
