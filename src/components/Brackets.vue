<template>
  <RequiresBrackets>
    <div class="bracket-grid">

      <!-- QUARTERFINALS -->
      <VerticalMatchUp
        v-for="i in 4"
        :key="'qf' + i"
        :startRow="quarterStartRow(i)"
        :column="quarterColumn(i)"
        :firstTeamName="getMatchUp(8, i)?.firstTeam"
        :secondTeamName="getMatchUp(8, i)?.secondTeam"
        :games="getMatchUp(8, i)?.games"
        @winningTeam="registerWin($event, i, 8)"
      />
      <!-- SEMIFINALS -->
      <VerticalMatchUp
        v-for="i in 2"
        :key="'sf' + i"
        :startRow="3"
        :column="semiColumn(i)"
        :firstTeamName="getMatchUp(4, i)?.firstTeam"
        :secondTeamName="getMatchUp(4, i)?.secondTeam"
        :games="getMatchUp(4, i)?.games"
        @winningTeam="registerWin($event, i, 4)"
      />

      <!-- FINALS -->
      <VerticalMatchUp
        class="finals"
        :startRow="1"
        :column="3"
        :firstTeamName="getMatchUp(2, 0)?.firstTeam"
        :secondTeamName="getMatchUp(2, 0)?.secondTeam"
        :games="getMatchUp(2, 0)?.games"
        @winningTeam="registerWin($event, 0, 2)"
      />

      <!-- THIRD PLACE-->
      <VerticalMatchUp
        :startRow="5"
        :column="3"
        :firstTeamName="getMatchUp(3, 0)?.firstTeam"
        :secondTeamName="getMatchUp(3, 0)?.secondTeam"
        :games="getMatchUp(3, 0)?.games"
        @winningTeam="registerWin($event, 0, 3)"
      />

    </div>
  </RequiresBrackets>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import VerticalMatchUp from './VerticalMatchUp.vue'
import { useGameStore } from '../stores/gameStore'
import { MatchUpTeamKeys, useBracketStore, type BracketSizes, type MatchUpIndices } from '../stores/bracketStore'
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
    matchUpLookup[searchKey].games.push(game)
  })

  return  Object.values(matchUpLookup).reduce((acc: any, matchUp: any) => ({...acc, [matchUp.bracketSize]: {...(acc[matchUp.bracketSize] || {}), [matchUp.matchUpIndex]: {...matchUp.matchUp, games: matchUp.games}}}), {})
})

function registerWin(teamName: string, index: number, bracketSize: number){
  const nextBracketSize = bracketSize / 2
  const correctedIndex = index - 1 
  const nextBracketIndex = Math.floor(correctedIndex / 2)

  let elementName = correctedIndex % 2 == 0 ? 'firstTeam' : 'secondTeam'
  if (teamName === undefined || bracketStore.getTeam(nextBracketSize.toString() as BracketSizes, nextBracketIndex.toString() as MatchUpIndices, elementName as MatchUpTeamKeys) === teamName){
    return
  }

  bracketStore.setTeam(nextBracketSize.toString() as BracketSizes, nextBracketIndex.toString() as MatchUpIndices, elementName as MatchUpTeamKeys, teamName)
}

function getMatchUp(bracketSize: number, matchUpIndex: number) {
  return matchUpsWithGames.value[bracketSize.toString()]?.[(matchUpIndex - 1).toString()]
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
