<script setup lang="ts">
import DataTable from 'primevue/datatable';
import Button from 'primevue/button';
import Column from 'primevue/column';
import Timer from './Timer.vue';
import SurvivorKillButton from './SurvivorKillButton.vue';
import { useProgressStore } from '../stores/gameProgress';
import { useTeamStore } from '../stores/teamStore';
import { computed } from 'vue';

const progressStore = useProgressStore()
const teamStore = useTeamStore()

const survivorTimes = computed(() => {
    const survivors = teamStore.survivors ?? []

    return survivors.map(survivor => {
        return {...(progressStore.killerEvents[survivor.id] ?? {}), survivorName: survivor.name, alive: progressStore.aliveSurvivors.includes(survivor.id), survivorId: survivor.id }
    })
})

function updateTimes(rowIndex: number){
    const row = survivorTimes.value[rowIndex]

    console.log(row)

    if (row === undefined){
        console.error("Could not find row!")
        return
    }

    console.log(row.firstHook)

    if (!row.firstHook){
        progressStore.firstHook(row.survivorId)
    }
    else {
        progressStore.survivorDead(row.survivorId)
    }
    console.log(progressStore.killerEvents)
}

function survivorEscaped(rowIndex: number){
    const row = survivorTimes.value[rowIndex]

    if (row === undefined){
        console.error("Could not find row!")
        return
    }

    progressStore.escaped(row.survivorId)
}
</script>/

<template>
    <DataTable :value="survivorTimes">
        <Column field="survivorName" header="Survivor Name"></Column>
        <Column header="First Hook">
            <template #body="slotProps">
                <Timer v-if="slotProps.data.alive || slotProps.data.firstHook !== undefined" :start-time="slotProps.data.firstHook?.referenceTime ?? progressStore.lastKillerEvent" :end-time="slotProps.data.firstHook?.eventTime ?? progressStore.currentGameTime"></Timer>
            </template>
        </Column>
        <Column header="Dead">
            <template #body="slotProps">
                <Timer v-if="slotProps.data.firstHook !== undefined && (slotProps.data.alive ||slotProps.data.dead !== undefined)" :start-time="slotProps.data.dead?.referenceTime ?? progressStore.lastKillerEvent" :end-time="slotProps.data.dead?.eventTime ?? progressStore.currentGameTime"></Timer>
            </template>
        </Column>
        <Column>
        <template #body="slotProps">
            <template v-if="slotProps.data.alive && progressStore.isRunning">
                <SurvivorKillButton :firstHook="slotProps.data.firstHook" :dead="slotProps.data.dead" @click="updateTimes(slotProps.index)"></SurvivorKillButton>
                <Button v-if="progressStore.canEscape" label="Escaped" @click="survivorEscaped(slotProps.index)"/>
            </template>
        </template>
        </Column>
    </DataTable>
</template>

<style scoped>
</style>
