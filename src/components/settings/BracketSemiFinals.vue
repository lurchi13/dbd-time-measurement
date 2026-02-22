<script setup lang="ts">
import Card from 'primevue/card'
import Select from 'primevue/select'
import RequiresTeams from '../RequiresTeams.vue'
import type { Team } from '../../models/Teams'
import { useBracketStore, type MatchUpIndices, MatchUpTeamKeys, AvailableBrackets } from '../../stores/bracketStore'

const bracketStore = useBracketStore()

const props = defineProps<{
    availableTeams: Team[]
    semiFinalIndex: number
}>()

function getIndexString(index: number) : MatchUpIndices{
    return ((index - 1) + (props.semiFinalIndex-1) * 2).toString() as MatchUpIndices
}

function getTeam(index: number, key: MatchUpTeamKeys)  {
    return bracketStore.getTeam(AvailableBrackets.QuarterFinals, getIndexString(index), key)
}

function setTeam(index: number, key: MatchUpTeamKeys, newValue: string | null){
    bracketStore.setTeam(AvailableBrackets.QuarterFinals, getIndexString(index), key, newValue ?? undefined)
}

function getOptions(selectedTeam: string | undefined){
    if (selectedTeam){
        return [...props.availableTeams, {name: selectedTeam}]
    }
    return props.availableTeams
}
</script>

<template>
    <RequiresTeams>
        <Card class="semi-final">
            <template #header><span style="color: white">Semifinal {{ semiFinalIndex }}</span></template>
            <template #content>
                <div class="card-grid">
                    <Card v-for="i in 2">
                        <template #header>Quarterfinal {{ i }}</template>
                        <template #content>
                            <Select :options="getOptions(getTeam(i, MatchUpTeamKeys.FirstTeam))" :model-value="getTeam(i, MatchUpTeamKeys.FirstTeam)" @update:model-value="setTeam(i, MatchUpTeamKeys.FirstTeam, $event)" optionLabel="name" optionValue="name" showClear />
                            <Select :options="getOptions(getTeam(i, MatchUpTeamKeys.SecondTeam))" :model-value="getTeam(i, MatchUpTeamKeys.SecondTeam)" @update:model-value="setTeam(i, MatchUpTeamKeys.SecondTeam, $event)" optionLabel="name" optionValue="name" showClear />
                        </template>
                    </Card>
                </div>
            </template>
        </Card>
    </RequiresTeams>
</template>

<style scoped>
.semi-final {
    background-color: gray;
}
.card-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 130px;
  gap: 12px 50px;
  align-items: center;
  padding: 20px;
}

</style>
