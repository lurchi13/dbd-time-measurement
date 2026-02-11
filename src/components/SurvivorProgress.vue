<script setup lang="ts">
import Card from 'primevue/card';

import { computed } from 'vue';
import { getEvaluation, getGameDetails, type SectionType, type EventRowType, type EventRow, getTimerEvent, getEmptyEvent, getStringEvent  } from '../utils';
import { type EventType } from '../models/ProgressEvents';
import ProgressTable from './ProgressTable.vue';

const props = defineProps<{
    gameStart: Date, 
    endGameCollapse?: Date,
    gameEnd?: Date,
    events: EventType[]
}>()

const survivorProgress = computed(() => {
    const events = [] as EventRow[]
    let lastEvent = props.gameStart
    let genCount = 0
    let escapeCount = 0
    let missingEvents = 0
    let gatesOpen = false
    let totalEventTime = 0
    
    const defaultSection = {id: 2, label: 'Default Events'} as SectionType
    const extraSection = {id: 3, label: 'Extra Events'} as SectionType

    const addEvent = (section: SectionType, label: string, type: EventRowType, value?: Date | string) => {
        if (type === 'timer' && value && value instanceof Date){
            totalEventTime += value.getTime() - lastEvent.getTime()
            events.push(getTimerEvent(section, label, lastEvent, value))
            lastEvent = value
            return
        }
        if (type === 'none'){
            events.push(getEmptyEvent(section, label))
        }
        if (type === 'string' && typeof value === 'string'){
            events.push(getStringEvent(section, label, value))
        }
        
    }

    const addMissingEvent = (label: string) => {
        events.push({section: defaultSection, label, type: 'none'})
        missingEvents++
    }

    const addMissingGenEvents = () => {
        if (genCount === 5){
            return
        }

        for (let i = genCount + 1; i < 6; i++){
            addMissingEvent(`Gen ${i}`)
        }
    }

    props.events.map(event => {
        switch(event.type){
            case 'gen':
                genCount++
                addEvent(defaultSection, `Gen ${event.index}`, 'timer', event.eventTime)
                break
            case 'exitOpen':
                addMissingGenEvents()
                addEvent(defaultSection, "Gates Open", 'timer', event.eventTime)
                gatesOpen = true
                break
            case 'hatchEscape':
                if (!gatesOpen){
                    addMissingGenEvents()
                    addEvent(extraSection, "Hatch-Escape", 'timer', event.eventTime)
                }
                if (++escapeCount % 2 == 0){
                    addEvent(defaultSection, `${escapeCount} Escapes`, 'timer', event.eventTime)
                }
                break
            case 'escaped':
                if (++escapeCount % 2 == 0){
                    addEvent(defaultSection, `${escapeCount} Escapes`, 'timer', event.eventTime)
                }
                break
            case 'firstHook':
                break
            case 'dead':
                break
        }
    })
    if (genCount < 5 && missingEvents === 0){
        addMissingGenEvents()
    }
    if (!gatesOpen){
        if (escapeCount === 0){
            missingEvents++
        }
        addEvent(defaultSection, "Gates Open", 'none')
    }
    if (escapeCount < 2){
        addMissingEvent("2 Escapes")
    }
    if (escapeCount < 4){
        addMissingEvent("4 Escapes")
    }

    return [
        ...getGameDetails(props.gameStart, props.endGameCollapse, props.gameEnd),
        ...events,
        ...getEvaluation(props.gameStart, lastEvent, missingEvents, 6)
    ]
})
</script>

<template>
<Card>
    <template #title>Gen Progress</template>
    <template #content>
        <ProgressTable :game-start="gameStart" :event-rows="survivorProgress"/>
    </template>
</Card>
</template>

<style scoped>
</style>
