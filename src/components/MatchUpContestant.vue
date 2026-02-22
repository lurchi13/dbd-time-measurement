<script setup lang="ts">
import Card from 'primevue/card'
import { computed } from 'vue';
import { getTimeString } from '../utils';

const props = defineProps<{
  teamName: string | undefined | null,
  teamIndex: number,
  result: any
}>()

const emit = defineEmits(["winningTeam"])

const gridPosition = computed(() => {
  return { gridColumn: '1', gridRow: props.teamIndex * 2 + 1}
})
</script>

<template>
  <template v-if="teamName && teamName !== 'undefined' && teamName !== 'null'">
    <Card class="team-card" :style="gridPosition" >
      <template #title>{{ teamName }}</template>
      <template #content>
        <template v-if="result">
          {{ getTimeString(result.totalAverageEventTime) }}<br>
          {{ result.missingEvents }}
        </template>
      </template>
    </Card>
  </template>
  <template v-else>
    <Card class="team-card unknown" :style="gridPosition" >
      <template #content>
        ?
      </template>
    </Card>
  </template>

</template>

<style scoped>
.team-card {
  width: 250px;
  text-align: center;
}

.unknown {
  background-color: lightgray;
}
.match-grid {
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: repeat(3, 80px);
  gap: 12px 50px;
  padding: 10px;
  align-items: center;
}
.match-card {
    background-color: gray;
}
</style>