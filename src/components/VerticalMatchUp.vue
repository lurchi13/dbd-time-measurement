<script setup lang="ts">
import Card from 'primevue/card'
import { computed, ref } from 'vue';
import { processGameProgress, type EvaluationModel } from '../utils';
import type { EventType } from '../models/ProgressEvents';
import Button from 'primevue/button';
import MatchUpContestant from './MatchUpContestant.vue';
import { type GameModel } from '../stores/gameStore';

const props = defineProps<{
  firstTeamName: string | undefined
  secondTeamName: string | undefined
  startRow: number,
  column: number
  games?: GameModel[]
  isFinal?: boolean
}>()
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         
const emit = defineEmits(["winningTeam"])
const winningTeam = ref("")

function analyzeTimeDiff(firstTeamTime: number, secondTeamTime: number){
  const timeDiff = firstTeamTime - secondTeamTime

  if (timeDiff > 0.5){
    return props.secondTeamName
  }
  if (timeDiff < -0.5){
    return props.firstTeamName
  }
  return undefined
}

function determineWinner(teamScores: Record<string, EvaluationModel>){
    if (props.firstTeamName === undefined){
      return
    }
    if (props.secondTeamName === undefined){
      return
    }
    const winner = analyzeTimeDiff(teamScores[props.firstTeamName]?.totalAverageEventTime || 0, teamScores[props.secondTeamName]?.totalAverageEventTime || 0) 

    if (winner !== undefined){
      return winner
    }

    const missingEventDiff = (teamScores[props.firstTeamName]?.missingEvents || 8) - (teamScores[props.secondTeamName]?.missingEvents || 8)

    if (missingEventDiff > 0 ){
      return props.firstTeamName
    }

    if (missingEventDiff < 0){
      return props.secondTeamName
    }
}

const gameResult = computed(() => {
    if (props.firstTeamName === undefined || props.secondTeamName === undefined || props.games === undefined || props.games.length === 0) {
      return {}
    }

    const teamScores = {} as Record<string, EvaluationModel>

    const initializeTeam = (teamName: string) => {
      teamScores[teamName] = {totalAverageEventTime: 0, missingEvents: 0, averageEventTime: 0, missingPenalty: 0}
    }

    initializeTeam(props.firstTeamName)
    initializeTeam(props.secondTeamName ?? null)

    let gameCount = 0
    const eventCallback = (): void => {}
    const mssingEventCallback = (): void => {}
    
    const updateTeam = (teamName: string, result: EvaluationModel) => {
      if (teamScores[teamName] !== undefined){
        teamScores[teamName].totalAverageEventTime += result.totalAverageEventTime
        teamScores[teamName].missingEvents += result.missingEvents
      }
    }

    props.games.map(game => {
        const events = game["events"].map((event): EventType => {return {...event, eventTime: new Date(event.eventTime)} as unknown as EventType})

        const result = processGameProgress(new Date(game["gameStart"]), events, eventCallback, mssingEventCallback)

        const killerTeam = game.killerTeam
        const survivorTeam = game.survivorTeam
        if (gameCount > 0 && !((killerTeam in teamScores) && (survivorTeam in teamScores))){
            console.error("Different teams played :(")
            return
        }
        updateTeam(killerTeam, result.killer)
        updateTeam(survivorTeam, result.survivors)

        gameCount++
    }
    )
    if (gameCount > 0){
      Object.keys(teamScores).forEach((teamName) => {
        if (teamScores[teamName]){
          teamScores[teamName].totalAverageEventTime /= gameCount
          teamScores[teamName].missingEvents /= gameCount
        }
      })
    }

    const winner = determineWinner(teamScores)
    if (winner) {
        winningTeam.value = winner
        emit("winningTeam", winner)
    }


    return teamScores
})

const backgroundColor = computed(() => {
    if (props.isFinal){
        return 'gold'
    }
    return 'gray'
})

function getContestantBackgroundColor(teamName: string | undefined){
    if (teamName === winningTeam.value){
        return "gold"
    }
    return "white"
}

function getTeamResults(teamName: string | undefined){
  if (teamName === undefined){
    return
  }

  return gameResult.value?.[teamName]
}
</script>

<template>
    <div :style="{gridColumn: column, gridRow: `${startRow}/${startRow+3}`}">
        <Card :style="{backgroundColor}">
            <template #content>
                <div class="match-grid">
                    <MatchUpContestant :team-name="props.firstTeamName" :team-index="0" :result="getTeamResults(props.firstTeamName)" :style="{backgroundColor: getContestantBackgroundColor(props.firstTeamName)}" />
                    <Button label="VS" :style="{ gridColumn: 1, gridRow: 2}" :disabled="games === undefined || games.length === 0"/>
                    <MatchUpContestant :team-name="props.secondTeamName" :team-index="1" :result="getTeamResults(props.secondTeamName)" :style="{backgroundColor: getContestantBackgroundColor(props.secondTeamName)}" />
                </div>

            </template>
        </Card>
    </div>

</template>

<style scoped>
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