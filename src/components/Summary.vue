<template>
    <section class="entry l-summary">
        <h2 class="title title--2" id="summary">Summary</h2>
        <Failure v-if="!rawData">
            Missing data. Summary could not be shown.
        </Failure>
        <div v-else>
            <div class="data l-summary__data">
                <label class="data__label l-summary__data__label">Reads</label>
                <output class="data__value l-summary__data__value">{{rawData.total}}</output>
            </div>
            <div class="data l-summary__data">
                <label class="data__label l-summary__data__label">Single-block reads</label>
                <output class="data__value l-summary__data__value">{{rawData.single_block}}</output>
            </div>
            <div class="data l-summary__data">
                <label class="data__label l-summary__data__label">Multiple-block reads</label>
                <output class="data__value l-summary__data__value">{{rawData.multiple_block}}</output>
            </div>
            <div class="data l-summary__data">
                <label class="data__label l-summary__data__label">Short Multiple-block reads</label>
                <output class="data__value l-summary__data__value">{{rawData.short_mutliple_block}}</output>
            </div>
            <div class="data l-summary__data">
                <label class="data__label l-summary__data__label">Reads too small</label>
                <output class="data__value l-summary__data__value">{{rawData.too_small_reads}}</output>
            </div>
            <div class="data l-summary__data">
                <label class="data__label l-summary__data__label">Removed reads</label>
                <output class="data__value l-summary__data__value">{{rawData.removed}}</output>
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

<style lang="scss">
.l-summary {
    &__data {
        display: flex;

        &__label {
            width: 100%;
            text-align: right;
        }
        &__value {
            width: 100%;
            text-align: left;
        }
    }
}
</style>
