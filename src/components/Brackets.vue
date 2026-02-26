<template>
  <RequiresBrackets>
    <div class="bracket-grid">

      <!-- QUARTERFINALS -->
      <VerticalMatchUp
        v-for="i in 4"
        :key="'qf' + i"
        :startRow="quarterStartRow(i)"
        :column="quarterColumn(i)"
        :firstTeamName="getMatchUp(AvailableBrackets.QuarterFinals, i)?.firstTeam"
        :secondTeamName="getMatchUp(AvailableBrackets.QuarterFinals, i)?.secondTeam"
        :games="getMatchUp(AvailableBrackets.QuarterFinals, i)?.games"
        @winningTeam="registerQuarterFinalWin($event, i)"
      />
      <!-- SEMIFINALS -->
      <VerticalMatchUp
        v-for="i in 2"
        :key="'sf' + i"
        :startRow="3"
        :column="semiColumn(i)"
        :firstTeamName="getMatchUp(AvailableBrackets.SemiFinals, i)?.firstTeam"
        :secondTeamName="getMatchUp(AvailableBrackets.SemiFinals, i)?.secondTeam"
        :games="getMatchUp(AvailableBrackets.SemiFinals, i)?.games"
        @winningTeam="registerSemiFinalWin($event, i)"
      />

      <!-- FINALS -->
      <VerticalMatchUp
        class="finals"
        :startRow="1"
        :column="3"
        :firstTeamName="getMatchUp(AvailableBrackets.Finals, 1)?.firstTeam"
        :secondTeamName="getMatchUp(AvailableBrackets.Finals, 1)?.secondTeam"
        :games="getMatchUp(AvailableBrackets.Finals, 1)?.games"
      />

      <!-- THIRD PLACE-->
      <VerticalMatchUp
        :startRow="5"
        :column="3"
        :firstTeamName="getMatchUp(AvailableBrackets.ThirdPlace, 1)?.firstTeam"
        :secondTeamName="getMatchUp(AvailableBrackets.ThirdPlace, 1)?.secondTeam"
        :games="getMatchUp(AvailableBrackets.ThirdPlace, 1)?.games"
      />

    </div>
  </RequiresBrackets>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import VerticalMatchUp from './VerticalMatchUp.vue'
import { useGameStore } from '../stores/gameStore'
import { AvailableBrackets, MatchUpTeamKeys, useBracketStore, type MatchUpIndices } from '../stores/bracketStore'
import RequiresBrackets from './RequiresBrackets.vue'

const gameStore = useGameStore()
const bracketStore = useBracketStore()

const matchUps = computed(() => bracketStore.brackets)

function normalizedName(firstTeamName: string, secondTeamName: string) {
  switch(firstTeamName.localeCompare(secondTeamName)){
    case (-1):
      return `${firstTeamName}|${secondTeamName}`;
    case (0):
      return firstTeamName
    case (1):
      return `${secondTeamName}|${firstTeamName}`;
  }
  return ""
}

const matchUpsWithGames = computed((): any => {
  const matchUpLookup = Object.fromEntries(
    Object.entries(matchUps.value).flatMap(
      ([bracketSize, matchUps]) => Object.entries(matchUps).map(([matchUpIndex, matchUp]) => [normalizedName(matchUp.firstTeam ?? '', matchUp.secondTeam ?? ''), {matchUp: matchUp, bracketSize, matchUpIndex,  games: []}])
    )
  ) as any
  gameStore.games.forEach(game => {
    const searchKey = normalizedName(game.killerTeam, game.survivorTeam)
    if (matchUpLookup[searchKey]){
          matchUpLookup[searchKey].games.push(game)
    }
  })
  return  Object.values(matchUpLookup).reduce((acc: any, matchUp: any) => ({...acc, [matchUp.bracketSize]: {...(acc[matchUp.bracketSize] || {}), [matchUp.matchUpIndex]: {...matchUp.matchUp, games: matchUp.games}}}), {})
})

function registerTeam(teamName: string, nextBracket: AvailableBrackets, index: number){
    const correctedIndex = index - 1 
    const nextBracketIndex = Math.floor(correctedIndex / 2)

    let elementName = correctedIndex % 2 == 0 ? 'firstTeam' : 'secondTeam'
    if (teamName === undefined || bracketStore.getTeam(nextBracket, nextBracketIndex.toString() as MatchUpIndices, elementName as MatchUpTeamKeys) === teamName){
      return
    }
    bracketStore.setTeam(nextBracket, nextBracketIndex.toString() as MatchUpIndices, elementName as MatchUpTeamKeys, teamName)
}

function registerSemiFinalWin(teamName: string, index: number){
  registerTeam(teamName, AvailableBrackets.Finals, index)
  const matchUp = getMatchUp(AvailableBrackets.SemiFinals, index)
  let otherTeam: string
  if (matchUp.firstTeam === teamName){
    otherTeam = matchUp.secondTeam
  }
  else {
    otherTeam = matchUp.firstTeam
  }
  registerTeam(otherTeam, AvailableBrackets.ThirdPlace, index)
}

function registerQuarterFinalWin(teamName: string, index: number){
  registerTeam(teamName, AvailableBrackets.SemiFinals, index)
}

function getMatchUp(bracketSize: AvailableBrackets, matchUpIndex: number) {
  return matchUpsWithGames.value[bracketSize]?.[(matchUpIndex - 1).toString()]
}

function quarterStartRow(matchUpIndex: number){
  return ((matchUpIndex - 1) % 2) * 4 + 1
}

function quarterColumn(matchUpIndex: number) {
  return matchUpIndex <= 2 ? 1 : 5
}


function semiColumn(matchUpIndex: number) {
  return (matchUpIndex) * 2
}
</script>

<style scoped>
.bracket-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
  grid-template-rows: repeat(7, 80px);
  gap: 12px 50px;
  align-items: center;
}
</style>
