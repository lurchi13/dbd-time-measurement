<script setup lang="ts">
import Card from 'primevue/card'
import JSONUpload from '../JSONUpload.vue'
import { useGameStore, type GameModel } from '../../stores/gameStore';
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import { computed, ref } from 'vue';
import { formatDate } from '../../utils';
import Button from 'primevue/button'
import GameResultDialog from '../GameResultDialog.vue';

const gameStore = useGameStore()
const games = computed(() => gameStore.games)
const selectedGames = ref()
const isVisible = ref(false)
const selectedGameDetails = ref<GameModel[]>([])

function loadGame(json: GameModel){
    json.gameStart = new Date(json.gameStart)
    json.endGameCollapse = json.endGameCollapse ? new Date(json.endGameCollapse) : undefined
    json.gameEnd = new Date(json.gameEnd)
    json.events = json.events.map(event => ({...event, eventTime: new Date(event.eventTime)}))

    gameStore.loadGame(json)
}

function openDetails(details: GameModel) {
    selectedGameDetails.value = [details]
    isVisible.value = true
}

function openSelectedDetails(){
    selectedGameDetails.value = selectedGames.value
    isVisible.value = true
} 
</script>

<template>
    <DataTable :value="games" v-model:selection="selectedGames" dataKey="gameId">
        <Column selectionMode="multiple" headerStyle="width: 3rem"></Column>
        <Column field="killerTeam" header="Killer Team"/>
        <Column field="survivorTeam" header="Survivor Team"/>
        <Column header="Game Start">
            <template #body="slotProps">
                {{ formatDate(slotProps.data.gameStart) }}
            </template>
        </Column>
        <Column header="Game End">
            <template #body="slotProps">
                {{ formatDate(slotProps.data.gameEnd) }}
            </template>
        </Column>
        <Column>
            <template #header>
                <Button icon="pi pi-info" @click="openSelectedDetails()"/>
            </template>
            <template #body="slotProps">
                <div class="buttons">
                    <Button icon="pi pi-info" @click="openDetails(slotProps.data)"/>
                </div>
            </template>
        </Column>
    </DataTable>
    <Card>
        <template #title>Upload Brackets</template>
        <template #content>
            <JSONUpload upload-label="Select Brackets" :multiple="true" @json-loaded="loadGame">
            </JSONUpload>
        </template>
    </Card>
    <GameResultDialog v-model:visible="isVisible" :games="selectedGameDetails">
    </GameResultDialog>
</template>

<style scoped>
</style>
