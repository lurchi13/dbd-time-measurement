<script setup lang="ts">
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Timer from './Timer.vue';

const props = defineProps<{
    gameCount: number,
    eventRows: any
}>()
</script>

<template>
    <DataTable :value="eventRows" >
        <Column field="label" header="Event"></Column>
        <Column v-for="i in gameCount" :key="i" :header="`Game ${i}`">
            <template #body="slotProps">
                <Timer v-if="slotProps.data.type === 'timer' && slotProps.data[(i-1).toString()]" :start-time="slotProps.data[(i-1).toString()].lastEvent" :end-time="slotProps.data[(i-1).toString()].eventTime"></Timer>
                <template v-if="slotProps.data.type === 'string'  && slotProps.data[(i-1).toString()] !== undefined">
                    {{ slotProps.data[(i-1).toString()] }}
                </template>
            </template>
        </Column>
    </DataTable>
</template>

<style scoped>
</style>
