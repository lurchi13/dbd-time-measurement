<script setup lang="ts">
import { computed } from 'vue'
import { useTeamStore } from '../../stores/teamStore'
import RequiresTeams from '../RequiresTeams.vue'
import BracketSemiFinals from './BracketSemiFinals.vue'
import { AvailableBrackets, useBracketStore } from '../../stores/bracketStore'
import Card from 'primevue/card'
import JSONUpload from '../JSONUpload.vue'

const teamStore = useTeamStore()
const bracketStore = useBracketStore()

const selectedTeams = computed(() => Object.values(bracketStore.getBracket(AvailableBrackets.QuarterFinals) || {}).flatMap(teams => [teams.firstTeam, teams.secondTeam]))
const teams = computed(() => teamStore.teams.filter(team => !selectedTeams.value.includes(team.name)))
</script>

<template>
    <RequiresTeams>
        <div class="card-grid">
            <BracketSemiFinals v-for="i in 2" :available-teams="teams" :semi-final-index="i"/>
        </div>
        <Card>
            <template #title>Upload Brackets</template>
            <template #content>
                <JSONUpload upload-label="Select Brackets" :multiple="false" @json-loaded="bracketStore.loadBrackets">
                </JSONUpload>
            </template>
        </Card>
    </RequiresTeams>
</template>

<style scoped>
.card-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 200px;
  gap: 12px 50px;
  align-items: center;
}
</style>
