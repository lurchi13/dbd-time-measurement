<script setup lang="ts">

import Dialog from 'primevue/dialog'
import { type GameModel } from '../stores/gameStore';
import { getTimeString, processGameProgress, type EventTypes, type GameEvaluationModel } from '../utils';
import { computed } from 'vue';
import ProgressTable from './ProgressTable.vue';
import Accordion from 'primevue/accordion'
import AccordionPanel from 'primevue/accordionpanel';
import AccordionHeader from 'primevue/accordionheader';
import AccordionContent from 'primevue/accordioncontent';

const props = defineProps<{
    games: GameModel[],
    title: string
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

type SideProgressLookupType = Record<string, Record<string, TimeRow | undefined | string>>

function getGameResult(eventLookup: Record<'killer' | 'survivors', SideProgressLookupType> , gameIndex: string, details: GameModel){
    const survivorIdLookup = {} as Record<number, number>

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
                return "firstHook"
            case 'dead':
                return "dead"
        }
    }


    const eventCallback = (eventType: EventTypes, lastEvent: Date, eventTime: Date, relevantId?: number) => {
        const times = {lastEvent, eventTime}
        const key = getEventKey(eventType, relevantId)
        
        if (key === undefined){
            return
        }

        if (eventType !== 'firstHook' && eventType !== 'dead'){
            if (eventLookup.survivors[key] === undefined){
                eventLookup.survivors[key] = {[gameIndex]: times}
                return
            }
            eventLookup.survivors[key][gameIndex] = times
            return
        }
        if (relevantId !== undefined){
            let id = survivorIdLookup[relevantId]
            if (id === undefined){
                id = Object.keys(survivorIdLookup).length
                survivorIdLookup[relevantId] = id
            }
            const survivorId = `${key}${id.toString()}`
            if (eventLookup.killer[survivorId] === undefined){
                eventLookup.killer[survivorId] = {[gameIndex]: times}
                return
            }
            eventLookup.killer[survivorId][gameIndex] = times
        }
    }

    const missingEventCallback = (): void => {}

    return processGameProgress(details.gameStart, details.gameEnd, details.events, eventCallback, missingEventCallback, details.slugEvents)
}

function formatEvaluations(evaluations: Record<string,GameEvaluationModel>, side: 'killer' | 'survivors'){
    const evaluationLookup = {} as Record<string, Record<string, string | undefined>>
    Object.entries(evaluations).forEach(
        ([gameIndex, evaluation]) => {
            Object.entries(evaluation[side]).forEach(([key, result]) => {
                let formattedResult = result
                if (key !== 'missingEvents'){
                    formattedResult = getTimeString(formattedResult)
                }

                if (evaluationLookup[key] !== undefined){
                    evaluationLookup[key][gameIndex] = formattedResult
                    return
                }
                evaluationLookup[key] = {[gameIndex]: formattedResult}
            })
        }
    )
    const getEvent = (key: string, label: string) => ({label, type: 'string', ...evaluationLookup[key]})
    return [
        getEvent('missingEvents', "Missing events"),
        getEvent('averageEventTime', "Total Score"),
        getEvent('totalAverageEventTime', "FinalScore"),
    ]
}

function formatSurvivorProgress(progress: SideProgressLookupType){
    const getEvent = (label: string) => ({label, type: 'timer', ...progress[label]})
    return [
        getEvent("Gen 1"),
        getEvent("Gen 2"),
        getEvent("Gen 3"),
        getEvent("Gen 4"),
        getEvent("Gen 5"),
        getEvent("Gates Open"),
        getEvent("2 Escapes"),
        getEvent("4 Escapes"),
        getEvent("Hatch-Escape"),
    ]
}

function formatKillerProgress(progress: SideProgressLookupType){
    const getEvent = (key: string, label: string) => ({label, type: 'timer', ...progress[key]})
    return [
        getEvent('firstHook0', "Fresh 1"),
        getEvent('firstHook1', "Fresh 2"),
        getEvent('firstHook2', "Fresh 3"),
        getEvent('firstHook3', "Fresh 4"),
        getEvent('dead0', "Kill 1"),
        getEvent('dead1', "Kill 2"),
        getEvent('dead2', "Kill 3"),
        getEvent('dead3', "Kill 4"),
    ]
}

const gameResult = computed((): Record<'survivorDetails' | 'survivorEvaluation' | 'killerDetails' | 'killerEvaluation', Record<string, TimeRow | string>[]>=> {
    const eventLookup = {survivors: {}, killer: {}} as Record<'killer' | 'survivors', SideProgressLookupType>
    if (props.games.length === 0){
        return {survivorDetails: [], survivorEvaluation: [], killerDetails: [], killerEvaluation: []}
    }

    const evaluations = Object.fromEntries(props.games.map((game, index) => [index.toString(), getGameResult(eventLookup, index.toString(), game)]))
    return {survivorDetails: formatSurvivorProgress(eventLookup.survivors), survivorEvaluation: formatEvaluations(evaluations, 'survivors'), killerDetails: formatKillerProgress(eventLookup.killer), killerEvaluation: formatEvaluations(evaluations, 'killer')}
})

</script>

<template>
    <Dialog v-model:visible="isVisible">
        <template #header><h2>{{ title }}</h2></template>
        <template v-if="games .length > 0">
            <div class="result-grid">
                <Accordion :value="['details', 'evaluation']" multiple>
                    <AccordionPanel value="details">
                        <AccordionHeader>Details Survivors</AccordionHeader>
                        <AccordionContent>
                            <ProgressTable :game-count="games.length" :event-rows="gameResult.survivorDetails"/>
                        </AccordionContent>
                    </AccordionPanel>
                    <AccordionPanel value="evaluation">
                        <AccordionHeader>Evaluation Survivors</AccordionHeader>
                        <AccordionContent>
                            <ProgressTable :game-count="games.length" :event-rows="gameResult.survivorEvaluation"/>
                        </AccordionContent>
                    </AccordionPanel>
                </Accordion>
                <Accordion :value="['details', 'evaluation']" multiple>
                    <AccordionPanel value="details">
                        <AccordionHeader>Details Killer</AccordionHeader>
                        <AccordionContent>
                            <ProgressTable :game-count="games.length" :event-rows="gameResult.killerDetails"/>
                        </AccordionContent>
                    </AccordionPanel>
                    <AccordionPanel value="evaluation">
                        <AccordionHeader>Details Killer</AccordionHeader>
                        <AccordionContent>
                            <ProgressTable :game-count="games.length" :event-rows="gameResult.killerEvaluation"/>
                        </AccordionContent>
                    </AccordionPanel>
                </Accordion>
            </div>
        </template>
    </Dialog>
</template>

<style scoped>
.result-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px 50px;
  align-items: center;
}
</style>
