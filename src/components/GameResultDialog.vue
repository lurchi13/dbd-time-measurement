<script setup lang="ts">

import Dialog from 'primevue/dialog'
import { type GameModel } from '../stores/gameStore';
import { processGameProgress, type EventTypes } from '../utils';
import { computed } from 'vue';
import ProgressTable from './ProgressTable.vue';

const props = defineProps<{
    games: GameModel[]
}>()

const isVisible = defineModel("visible", {required: true, type: Boolean})

interface TimeRow {
    lastEvent: Date,
    eventTime: Date
}

/* interface SurvivorProgress {
    gen1?: TimeRow,
    gen2?: TimeRow,
    gen3?: TimeRow,
    gen4?: TimeRow,
    gen5?: TimeRow,
    exitOpen?: TimeRow,
    escaped2?: TimeRow,
    escaped4?: TimeRow,
    hatchEscape?: TimeRow

} */

function getGameResult(details: GameModel){
    const survivorEventLookup = {} as Record<string, TimeRow | undefined>
    const killerEventLookup = Object.fromEntries(details.survivors.map(survivor => [survivor.id, {name: survivor.name, firstHook: undefined, dead: undefined}]))  as Record<string, Record<string, TimeRow | string | undefined>>

    const getEventKey = (type: string, relevantId?: number) => {
        switch(type){
            case 'gen':
                return `Gen ${relevantId}`
            case 'exitOpen':
                return "Gates Open"
            case 'hatchEscape':
                return "Hatch-Escape"
            case 'escaped':
                return `${relevantId} Escapes`
            case 'firstHook':
                return "First Hook"
            case 'dead':
                return "Survivor Dead"
        }
    }


    const eventCallback = (eventType: EventTypes, lastEvent: Date, eventTime: Date, relevantId?: number) => {
        const times = {lastEvent, eventTime}
        const key = getEventKey(eventType, relevantId)
        
        if (key === undefined){
            return
        }

        if (eventType !== 'firstHook' && eventType !== 'dead'){
            if (survivorEventLookup[key] === undefined){
                return
            }
            survivorEventLookup[key] = times
            return
        }
        if (relevantId !== undefined){
            const killerEventRow = killerEventLookup[relevantId?.toString()]
            if (killerEventRow && killerEventRow[key]){
                killerEventRow[key] = times
            }
        }
    }

    const missingEventCallback = (): void => {}

    const result = processGameProgress(details.gameStart, details.events, eventCallback, missingEventCallback)

    return {survivors: {events: survivorEventLookup, evaluation: result.survivors}, killer: {events: killerEventLookup, evaluation: result.killer}}
}

function formatCategory(categoryData: any, type: 'timer' | 'string'){
    return Object.entries(categoryData).map(([label, games]) => ({label, type, ...(games as Object)}))
}

function formatSurvivorEvents(survivorProgress: any){
    const results = {} as Record<string, any>

    survivorProgress.forEach((gameSurvivorProgress: any, index: number) => {
        const indexString = index.toString()
        Object.entries(gameSurvivorProgress.survivors).forEach(([category, items]) => {
            Object.entries(items as Object).forEach(([label, result]) => {
                if (category in results){
                    if (label in results[category]){
                        results[category][label][indexString] = result
                    }
                    else {
                        results[category][label] = {[indexString]: result}
                    }
                }
                else {
                    results[category] = {[label]: {[indexString]: result}}
                }
            })
        })
    })

    return [
        ...formatCategory(results.events, 'timer'),
        ...formatCategory(results.evaluation, 'string')
    ]
}

const gameResult = computed(() => {
    if (props.games.length === 0){
        return []
    }

    const gameResults = props.games.map(game => getGameResult(game))

    return formatSurvivorEvents(gameResults)
})

</script>

<template>
    <Dialog v-model:visible="isVisible">
        <template v-if="games .length > 0">
            <ProgressTable :game-count="games.length" :event-rows="gameResult"/>
        </template>
    </Dialog>
</template>

<style scoped>
</style>
