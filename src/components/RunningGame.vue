<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { Button } from 'primevue';
import SurvivorKills from './SurvivorKills.vue';
import { useProgressStore } from '../stores/gameProgress';
import { FocusedSide } from '../stores/gameStore';
import GameControlButton from './GameControlButton.vue';
import Select from 'primevue/select';
import { useTeamStore } from '../stores/teamStore';
import { useRouter } from 'vue-router';

const focusedSideOptions = ref([
    {label: 'Killer', value: FocusedSide.Killer},
    {label: 'Survivors', value: FocusedSide.Survivors}
])
const selectedFocusedSide = ref<null | FocusedSide>(null)

const progressStore = useProgressStore()
const teamStore = useTeamStore()
const router = useRouter()
const progressButtons = computed(() => {
  const progressEvents = [] as {label: string, eventType: 'gen' | 'exitOpen' | 'hatchEscape'}[]
  progressStore.nextPossibleSurvivorEvents.forEach(event => {
    switch (event.type){
      case 'gen':
        progressEvents.push({label: `${event.index}. Gen Done`, eventType: event.type})
        break
      case 'exitOpen':
        progressEvents.push({label: "Exit Open", eventType: event.type})
        break
      case 'hatchEscape':
        progressEvents.push({label: "Hatch Escape", eventType: event.type})
        break
      case 'escaped':
        break
    }
  })
  return progressEvents
})

function addEvent(event: 'gen' | 'exitOpen' | 'hatchEscape'){
  if (event){
    switch (event){
      case 'gen':
        return progressStore.genDone()
      case 'exitOpen':
        return progressStore.exitOpen()
      case 'hatchEscape':
        return progressStore.hatchEscape()
    }
  }
}

onMounted(() => {
  selectedFocusedSide.value = null
    if (!teamStore.ready){
        router.push("/measure/setup/game")
    }
})
</script>

<template>
  <template v-if="selectedFocusedSide === null || !progressStore.isRunning">
    Which side will you focus on? <br>
    <Select :options="focusedSideOptions" v-model="selectedFocusedSide" optionLabel="label" optionValue="value"></Select>
  </template>
  <template v-if="selectedFocusedSide !== null">
    <GameControlButton :is-running="progressStore.isRunning" :game-start="progressStore.gameStart" :current-game-time="progressStore.currentGameTime" @start-game="() => progressStore.startGame(selectedFocusedSide ?? undefined)" @stop-game="progressStore.stopGame"/>
      <br/><br/>
    <template v-if="progressStore.isRunning">
        <Button v-for="progressButton in progressButtons"  :key="progressButton?.label" :label="progressButton?.label" @click="addEvent(progressButton.eventType)"></Button>
        <Button v-if="progressStore.hatchSpawned && progressStore.endGameCollapseStart === null" severity="danger" label="Hatch Closed" @click="progressStore.hatchClosed"></Button>
        <br/>
        <SurvivorKills />
    </template>
  </template>
  <br/>
  <Button label="Undo Last Survivor Event" @click="progressStore.undoLastSurvivorEvent"></Button>
  <Button label="Undo Last Killer Event" @click="progressStore.undoLastKillerEvent"></Button>
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
