<!-- <script setup lang="ts">

import Dialog from 'primevue/dialog'
import { type GameModel } from '../stores/gameStore';
import { type SectionType, type EventRow, processGameProgress, getTimerEvent, getEmptyEvent, getStringEvent, getTimeString, type EvaluationModel, getGameDetails } from '../utils';
import { computed } from 'vue';
import ProgressTable from './ProgressTable.vue';

const props = defineProps<{
    details?: GameModel
}>()

const isVisible = defineModel("visible", {required: true, type: Boolean})

const gameResult = computed(() => {

    if (props.details === undefined){
        return
    }

    const survivorEvents = [] as EventRow[]
    const killerEventLookup = Object.fromEntries(props.details.survivors.map(survivor => [survivor.id, {name: survivor.name, firstHook: undefined, dead: undefined}]))

    const defaultSection = {id: 2, label: 'Default Events'} as SectionType
    const extraSection = {id: 3, label: 'Extra Events'} as SectionType

    const addSurvivorEvent = (section: SectionType, label: string, lastEvent: Date, eventTime: Date) => {
        survivorEvents.push(getTimerEvent(section, label, lastEvent, eventTime))
    }

    const addMissingSurvivorEvent = (label: string) => {
        survivorEvents.push({section: defaultSection, label, type: 'none'})
    }

    const getEvaluation = (events: EventRow[], evaluation: EvaluationModel) => {
        const section = {id: 10, label: 'Evaluation'} as SectionType

        let averageEventTimeEvent
        if (evaluation.missingEvents >= 8){
            averageEventTimeEvent = getEmptyEvent(section, "Average Event Time")
        }
        else {
            averageEventTimeEvent = getStringEvent(section, "Average Event Time", getTimeString(evaluation.averageEventTime))
        }

        return [
            ...events,
            averageEventTimeEvent,
            getStringEvent(section, "Missing Event Count", evaluation.missingEvents.toString()),
            getStringEvent(section, "Penalty", getTimeString(evaluation.missingPenalty)),
            getStringEvent(section, "Total Average Event Time", getTimeString(evaluation.totalAverageEventTime))
        ]

    }


    const getLabel = (type: string, relevantId?: number) => {
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

    const missingEventCallback = (eventType: string, relevantId?: number): void => {
        const label = getLabel(eventType, relevantId)
        if (eventType !== 'firstHook' && eventType !== 'dead'){
            addMissingSurvivorEvent(label)
            return
        }
    }

    const eventCallback = (eventType: EventTypes, lastEvent: Date, eventTime: Date, relevantId?: number) => {
        const label = getLabel(eventType, relevantId)
        if (eventType === 'hatchEscape'){
            addSurvivorEvent(extraSection, label, lastEvent, eventTime)
            return
        }
        if (eventType !== 'firstHook' && eventType !== 'dead'){
            addSurvivorEvent(defaultSection, label, lastEvent, eventTime)
            return
        }
    }

    const result = processGameProgress(props.details.gameStart, props.details.events, eventCallback, missingEventCallback)
    const gameDetails = getGameDetails(props.details.gameStart, props.details.endGameCollapse, props.details.gameEnd)
    const killerEvents = Object.entries(killerEventLookup).flatMap(([survivorId, events], index) => {
        const survivorSection = {id: index + 2, label: events.name} as SectionType

        const getStage = (stage: {lastEvent: Date, eventTime: Date} | undefined, label: string) => {
            if (stage === undefined){
                return getEmptyEvent(survivorSection, label)
            }
            const {lastEvent, eventTime} = stage
            return getTimerEvent(survivorSection, label, lastEvent, eventTime)
        }

        return [
            getStage(events.firstHook, "First Hook"),
            getStage(events.dead, "Survivor Dead")
        ]
    })
    return {
        survivors: [
            ...getEvaluation(survivorEvents, result.survivors)
        ],
        killer: [
            ...getEvaluation(killerEvents, result.killer)
        ]
    }
})

</script>

<template>
    <Dialog v-model:visible="isVisible">
        <template v-if="details">
            <ProgressTable :game-start="details.gameStart" :event-rows="gameResult?.survivors"/>
            <ProgressTable :game-start="details.gameStart" :event-rows="gameResult?.killer"/>
        </template>
    </Dialog>
</template>

<style scoped>
</style>
 -->