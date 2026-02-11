<script setup lang="ts">
import { computed, ref } from 'vue';
import { Button } from 'primevue';
import SurvivorKills from './SurvivorKills.vue';
import { useProgressStore } from '../stores/gameProgress';
import Timer from './Timer.vue';
import SurvivorProgress from './SurvivorProgress.vue';
import { useTeamStore } from '../stores/teamStore';
import KillerProgress from './KillerProgress.vue';
import type { TeamMember } from '../models/Teams';
import Drawer from 'primevue/drawer'

const teamStore = useTeamStore()
const progressStore = useProgressStore()
const gameStateButtonLabel = computed(() => !progressStore.isRunning ? "Start New Game" : "Game Over")
const hatchClosed = ref(false)
const survivorProgressVisible = ref(false) 
const killerProgressVisible = ref(false)
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

function handleGameStateChange() {
  if (!progressStore.isRunning){
    progressStore.startGame(teamStore.survivors ?? [])
  }
  else {
    progressStore.stopGame()
  }
}

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

const survivorEvents = computed(() => {
  return teamStore.survivors?.map(survivor => {return {name: survivor.toString(), id: survivor} as TeamMember}) ?? []
})
</script>

<template>
  <Button :label="gameStateButtonLabel" @click="handleGameStateChange"/><Timer v-if="progressStore.isRunning" :start-time="progressStore.gameStart" :end-time="progressStore.currentGameTime"></Timer><br/>
  <template v-if="progressStore.isRunning">
      <Button v-for="progressButton in progressButtons"  :key="progressButton?.label" :label="progressButton?.label" @click="addEvent(progressButton.eventType)"></Button>
      <Button v-if="progressStore.hatchSpawned && !hatchClosed" severity="danger" label="Hatch Closed" @click="progressStore.hatchClosed"></Button>
      <br/>
      <SurvivorKills />
  </template>
  <template v-if="!progressStore.isRunning && progressStore.events.length > 0">
    <div class="card flex justify-center">
      <Drawer v-model:visible="survivorProgressVisible" header="Survivor Results" class="!w-full md:!w-100 lg:!w-[70rem]">
          <SurvivorProgress :game-start="progressStore.gameStart" :end-game-collapse="progressStore.endGameCollapseStart ?? undefined" :game-end="progressStore.isRunning ? undefined : progressStore.currentGameTime" :events="progressStore.events"></SurvivorProgress>
      </Drawer>
      <Button label="View Survivor Results" @click="survivorProgressVisible = true" />
      <Drawer v-model:visible="killerProgressVisible" header="Killer Results" position="right" class="!w-full md:!w-100 lg:!w-[70rem]">
          <KillerProgress :gameStart="progressStore.gameStart" :end-game-collapse="progressStore.endGameCollapseStart ?? undefined" :game-end="progressStore.isRunning ? undefined : progressStore.currentGameTime" :events="progressStore.events" :survivors="survivorEvents"></KillerProgress>
      </Drawer>
      <Button label="View Killer Results" @click="killerProgressVisible = true" />
    </div>
  </template>
  
  
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
