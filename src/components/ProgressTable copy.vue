<script setup lang="ts">
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';

import Timer from './Timer.vue';
import { type EventRow } from '../utils';

const props = defineProps<{
    gameStart: Date,
    eventRows: EventRow[]
}>()
</script>

<template>
    <DataTable :value="eventRows" rowGroupMode="subheader" groupRowsBy="section.id" sortMode="single" sortField="section.id">
        <Column field="label" header="Event"></Column>
        <Column header="Time In-Game">
            <template #body="slotProps">
                <Timer v-if="slotProps.data.type === 'timer'" :start-time="gameStart" :end-time="slotProps.data.eventTime"></Timer>
                <template></template>
            </template>
        </Column>
        <Column header="Delta">
            <template #body="slotProps">
                <Timer v-if="slotProps.data.type === 'timer'" :start-time="slotProps.data.referenceTime" :end-time="slotProps.data.eventTime"></Timer>
                <template v-if="slotProps.data.type === 'string'">
                    {{ slotProps.data.value }}
                </template>
            </template>
        </Column>
        <template #groupheader="slotProps">
            <span>{{ slotProps.data.section.label }}</span>
        </template>
    </DataTable>
</template>

<style scoped>
</style>
