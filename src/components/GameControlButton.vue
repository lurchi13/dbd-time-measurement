<script setup lang="ts">
import { computed } from 'vue';
import { Button } from 'primevue';
import Timer from './Timer.vue';

const props = defineProps<{
    isRunning: boolean,
    gameStart: Date
    currentGameTime: Date
}>()

const emit = defineEmits(["startGame", "stopGame"])

const gameStateButtonLabel = computed(() => !props.isRunning ? "Start New Game" : "Game Over")

function handleGameStateChange() {
  if (!props.isRunning){
    emit("startGame")
  }
  else {
    emit("stopGame")
  }
}
</script>

<template>
    <div class="gap-1">
        <Button :label="gameStateButtonLabel" @click="handleGameStateChange"/>
        <Timer v-if="isRunning" :start-time="gameStart" :end-time="currentGameTime"></Timer><br/>
    </div>
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
