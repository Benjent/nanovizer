<template>
    <section class="entry">
        <h2 class="title title--2" id="summary">Summary</h2>
        <div v-if="data">
            <div class="data">
                <label class="data__label">Total</label>
                <output class="data__value">{{data.total}}</output>
            </div>
            <div class="data">
                <label class="data__label">Single block</label>
                <output class="data__value">{{data.single_block}}</output>
            </div>
            <div class="data">
                <label class="data__label">Multiple block count</label>
                <output class="data__value">{{data.multiple_block}}</output>
            </div>
            <div class="data">
                <label class="data__label">Short multiple block count</label>
                <output class="data__value">{{data.short_mutliple_block}}</output>
            </div>
            <div class="data">
                <label class="data__label">Removed reads</label>
                <output class="data__value">{{data.removed}}</output>
            </div>
        </div>
    </section>
</template>

<script>
export default {
    props: {
        data: {
            type: Object,
        },
    },
}
</script>
