<script setup lang="ts">
import Card from 'primevue/card';

import { computed } from 'vue';
import { getKillerEventLookup, type DateRow, type SectionType, getEmptyEvent, getTimerEvent, getGameDetails, getEvaluation } from '../utils';
import { type EventType } from '../models/ProgressEvents';
import type { TeamMember } from '../models/Teams';
import ProgressTable from './ProgressTable.vue';

const props = defineProps<{
    gameStart: Date,
    endGameCollapse?: Date,
    gameEnd?: Date,
    events: EventType[]
    survivors: TeamMember[]
}>()

const killerProgress = computed(() => {
    let missingEvents = 0
    let lastEvent: Date = props.gameStart
    const eventMapping = getKillerEventLookup(props.gameStart, props.events)
    const events = props.survivors.flatMap((survivor, index) => {
        const survivorEvents = eventMapping[survivor.id]
        const survivorSection = {id: index + 2, label: survivor.name} as SectionType

        const getStageEvent = (times: DateRow | undefined, label: string) => {
            if (times){
                if (lastEvent < times.eventTime){
                    lastEvent = times.eventTime
                }
                return getTimerEvent(survivorSection, label, times.referenceTime, times.eventTime)
            }
            missingEvents++
            return getEmptyEvent(survivorSection, label)
        }

        return [getStageEvent(survivorEvents?.firstHook, "First Hook"), getStageEvent(survivorEvents?.dead, "Survivor Dead")]
    })

    return [
        ...getGameDetails(props.gameStart, props.endGameCollapse, props.gameEnd),
        ...events,
        ...getEvaluation(props.gameStart, lastEvent, missingEvents)
    ]
})
</script>

<template>
    <ProgressTable :game-start="gameStart" :event-rows="killerProgress"/>
</template>

<style scoped>
</style>
