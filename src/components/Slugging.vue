<script setup lang="ts">
import Button from 'primevue/button';
import Column from 'primevue/column';
import Timer from './Timer.vue';
import { useTeamStore } from '../stores/teamStore';
import { computed, onMounted } from 'vue';
import SurvivorMeasurementTable from './SurvivorMeasurementTable.vue';
import GameControlButton from './GameControlButton.vue';
import { useSlugStore } from '../stores/slugStore';
import { useRouter } from 'vue-router';

const slugStore = useSlugStore()
const teamStore = useTeamStore()
const router = useRouter()

enum SurvivorState {
    Down = 'down',
    Picked = 'picked',
    Neither = 'neither'
}

const survivorTimes = computed(() => {
    const survivors = teamStore.survivors ?? []

    return survivors.map(survivor => {
        const survivorId = survivor.id
        const pickedUp = slugStore.pickedUpSurvivor === survivorId
        const commonFields = {survivorName: survivor.name, survivorId}
        if (pickedUp) {
            return {...commonFields, state: SurvivorState.Picked, timeBeforePickUp: slugStore.timeBeforePickUp}
        }
        const slugStart = slugStore.sluggedSurvivors[survivor.id]
        if (slugStart){
            return {...commonFields, state: SurvivorState.Down, startDate: slugStore.sluggedSurvivors[survivor.id]}
        }
        return {...commonFields, state: SurvivorState.Neither}
    })
})

onMounted(() => {
    if (!teamStore.ready){
        router.push("/measure/setup/slug")
    }
})
</script>

<template>
    <GameControlButton :is-running="slugStore.isRunning" :game-start="slugStore.gameStart" :current-game-time="slugStore.currentGameTime" @start-game="slugStore.startGame" @stop-game="slugStore.stopGame"></GameControlButton>
        <SurvivorMeasurementTable :table-data="survivorTimes">
            <template #columns>
                <Column header="Time on Ground">
                    <template #body="slotProps">
                        <template v-if="slotProps.data.state === SurvivorState.Down">
                            <Timer :start-time="slotProps.data.startDate" :end-time="slugStore.currentGameTime"></Timer>
                        </template>
                        <template v-else-if="slotProps.data.state === SurvivorState.Picked">
                            {{ slotProps.data.timeBeforePickUp }}
                        </template>
                    </template>
                </Column>
                <Column>
                    <template #body="slotProps">
                        <template v-if="slotProps.data.state === SurvivorState.Down">
                            <template v-if="!slugStore.pickedUpSurvivor"><Button label="Picked Up" severity="danger" @click="() => {slugStore.survivorPickedUp(slotProps.data.survivorId)}"/></template>
                        </template>
                        <template v-else-if="slotProps.data.state === SurvivorState.Picked">
                            <Button label="On Floor" severity="danger" @click="() => {slugStore.survivorDown(slotProps.data.survivorId)}"/>
                        </template>
                        <template v-else>
                            <Button label="On Floor" severity="danger" @click="() => {slugStore.survivorDown(slotProps.data.survivorId)}"/>
                        </template>
                    </template>
                </Column>
                <Column>
                    <template #body="slotProps">
                        <template v-if="slotProps.data.state === SurvivorState.Down">
                            <Button label="No longer on Ground" @click="() => {slugStore.survivorNotOnGround(slotProps.data.survivorId)}"/>
                        </template>
                        <template v-else-if="slotProps.data.state === SurvivorState.Picked">
                            <Button label="Hooked /Wiggled free" @click="() => {slugStore.survivorNotOnGround(slotProps.data.survivorId)}"/>
                        </template>
                    </template>
                </Column>
            </template>
        </SurvivorMeasurementTable> 
</template>

<style scoped>
</style>
