import { defineStore } from "pinia"
import { computed, ref, type Ref } from "vue"
import type { FirstHook, SurvivorDead, GenDone, Escaped, ExitOpen, HatchEscape, EventType, SurvivorEventType, KillerEventType } from "../models/ProgressEvents"
import { useTeamStore } from "./teamStore"


interface DateRow {
    referenceTime: Date,
    eventTime: Date
}

interface KillerEventRow {
    firstHook?: DateRow,
    dead?: DateRow
}

export const useProgressStore = defineStore('progress', () => {
    const deadSurvivorCount = ref<number>(0)
    const escapedSurvivorCount = ref<number>(0)
    const repairedGenCount = ref<number>(0)
    const exitOpened = ref<boolean>(false) 
    const gameStart = ref(new Date())
    const currentGameTime = ref(new Date())
    const internalInterval = ref<number | null>(null)
    const internalAliveSurvivors = ref<number[]>([])
    const endGameCollapseStart = ref<Date | null>(null)

    const internalSurvivorEvents = ref<Array<SurvivorEventType>>([])
    const internalKillerEvents = ref<Array<KillerEventType>>([])
    
    const survivorEvents = computed(() => internalSurvivorEvents.value)
    const killerEvents = computed((): Record<number, KillerEventRow> => {
        const killerEvents: Record<number, KillerEventRow> = {}
        let lastEvent: Date = gameStart.value
        internalKillerEvents.value.forEach((event: KillerEventType) => {
            if (!(event.survivorId in killerEvents)){
                killerEvents[event.survivorId] = {}
            }
            const survivorEvents = killerEvents[event.survivorId]
            if (survivorEvents === undefined){
                console.error("Survivor is not in killerEvents")
                return {}
            }
            survivorEvents[event.type] = {referenceTime: lastEvent, eventTime: event.eventTime }
            lastEvent = event.eventTime
        }) 
        return killerEvents
    })
    const events = computed(() => {
        const events = [...internalSurvivorEvents.value, ...internalKillerEvents.value]
        return events.sort((a: EventType, b: EventType) => a.eventTime.getTime() - b.eventTime.getTime())
    })

    const lastKillerEvent =computed(() =>{
        return internalKillerEvents.value[internalKillerEvents.value.length - 1]?.eventTime ?? gameStart.value
    } )
    const isRunning = computed(() => internalInterval.value !== null)
    const hatchSpawned = computed(() => deadSurvivorCount.value + escapedSurvivorCount.value === 3)
    const nextPossibleSurvivorEvents = computed(() => {
        const availableEvents = []
        if (repairedGenCount.value < 5){
            availableEvents.push({eventTime: new Date(), index: repairedGenCount.value + 1, type: 'gen'} as GenDone)
        }
        else if (!exitOpened.value) {
            availableEvents.push({eventTime: new Date(), type: 'exitOpen'} as ExitOpen)
        }
        else if (exitOpened.value) {
            availableEvents.push({eventTime: new Date(), type: 'escaped'} as Escaped)
        }
        if (hatchSpawned.value){
            availableEvents.push({eventTime: new Date(), type: 'hatchEscape'} as HatchEscape)
        }
        return availableEvents
    })
    const canEscape = computed(() => {
        return exitOpened.value || hatchSpawned.value
    })
    const aliveSurvivors = computed(() => {
        return internalAliveSurvivors.value
    })

    function updateGameTime(){
        currentGameTime.value = new Date()
        if ((endGameCollapseStart.value ?? currentGameTime.value).getTime() - gameStart.value.getTime() > 900000){
            stopGame()
            return
        }
    }

    function startGame(){
        const teamStore = useTeamStore()

        if (!teamStore.ready){
            console.error("Could not start game, select teams first")
            return
        }

        internalAliveSurvivors.value = teamStore.survivorIds
        exitOpened.value = false
        deadSurvivorCount.value = 0
        escapedSurvivorCount.value = 0
        repairedGenCount.value = 0
        gameStart.value = new Date()
        endGameCollapseStart.value = null
        currentGameTime.value = gameStart.value
        internalInterval.value = setInterval(updateGameTime, 1)
        internalKillerEvents.value = []
        internalSurvivorEvents.value = []
    }

    function checkGameOver(){
        if (deadSurvivorCount.value + escapedSurvivorCount.value >= 4){
            stopGame()
            return true
        }
    }

    function stopGame(){
        if (internalInterval.value !== null){
            clearInterval(internalInterval.value)
            internalInterval.value = null
            const json = JSON.stringify(events.value, null, 2)

            const blob = new Blob([json], { type: 'application/json' })
            const url = URL.createObjectURL(blob)

            const a = document.createElement('a')
            a.href = url
            a.download = 'data.json'
            a.click()

            URL.revokeObjectURL(url)
        }
    }

    function addSurvivorEvent(event: SurvivorEventType){
        internalSurvivorEvents.value = [...internalSurvivorEvents.value, event]
    }

    function addKillerEvent(event: KillerEventType){
        internalKillerEvents.value = [...internalKillerEvents.value, event]
    }

    function firstHook(survivorId: number){
        addKillerEvent({eventTime: currentGameTime.value, survivorId, type: 'firstHook'} as FirstHook)
    }

    function survivorDead(survivorId: number){
        deadSurvivorCount.value = deadSurvivorCount.value + 1
        internalAliveSurvivors.value = internalAliveSurvivors.value.filter(aliveId => aliveId !== survivorId)
        checkGameOver()
        addKillerEvent({eventTime: currentGameTime.value, survivorId, type: 'dead'} as SurvivorDead)
    }

    function genDone(){
        repairedGenCount.value = repairedGenCount.value + 1
        addSurvivorEvent({eventTime: currentGameTime.value, index: repairedGenCount.value, type: 'gen'} as GenDone)
    }

    function exitOpen(){
        const time = currentGameTime.value
        endGameCollapseStart.value = time
        exitOpened.value = true
        addSurvivorEvent({eventTime: time, type: 'exitOpen'} as ExitOpen)
    }

    function escaped(survivorId: number){
        if (!exitOpened.value){
            hatchEscape()
            return
        }
        addSurvivorEvent({eventTime: currentGameTime.value, survivorId, type: 'escaped' } as Escaped)
        escapedSurvivorCount.value = escapedSurvivorCount.value + 1
        internalAliveSurvivors.value = internalAliveSurvivors.value.filter(aliveId => aliveId !== survivorId)
        checkGameOver()
    }

    function hatchEscape(){
        addSurvivorEvent({eventTime: currentGameTime.value, type: 'hatchEscape'} as HatchEscape)
        escapedSurvivorCount.value = escapedSurvivorCount.value + 1
        internalAliveSurvivors.value = []
        checkGameOver()
    }

    function hatchClosed(){
        endGameCollapseStart.value = currentGameTime.value
    }
    function undoLastEvent(ref: Ref<EventType[]>, ) {
        const lastEvent = ref.value.find((value, index) => index === ref.value.length - 1)
        ref.value = ref.value.filter((value, index) => index !== ref.value.length - 1)
        return lastEvent
    }

    function undoAliveSurvivorLeft(survivorId: number) {
        internalAliveSurvivors.value = [...internalAliveSurvivors.value, survivorId]
    }

    function undoLastSurvivorEvent() {
        const lastEvent = undoLastEvent(internalSurvivorEvents)

        if (lastEvent === undefined){
            return
        }

        switch (lastEvent?.type){
            case 'escaped':
                escapedSurvivorCount.value --
                undoAliveSurvivorLeft(lastEvent.survivorId)
                break
            case 'exitOpen':
                exitOpened.value = false
                break
            case 'gen':
                repairedGenCount.value --
                break
            case 'hatchEscape':
                escapedSurvivorCount.value --
                // TODO: reset internal Alive Survivors
        }
    }
    function undoLastKillerEvent() {
        const lastEvent = undoLastEvent(internalKillerEvents) as KillerEventType

        switch (lastEvent?.type){
            case 'dead':
                deadSurvivorCount.value --
                undoAliveSurvivorLeft(lastEvent.survivorId)
        }
    }

    return {
        deadSurvivorCount,
        escapedSurvivorCount,
        repairedGenCount,
        gameStart,
        currentGameTime,
        internalSurvivorEvents,
        internalKillerEvents,
        survivorEvents,
        killerEvents,
        events,
        lastKillerEvent,
        isRunning,
        nextPossibleSurvivorEvents,
        hatchSpawned,
        canEscape,
        aliveSurvivors,
        endGameCollapseStart,
        startGame,
        stopGame,
        firstHook,
        survivorDead,
        genDone,
        exitOpen,
        escaped,
        hatchEscape,
        hatchClosed,
        undoLastSurvivorEvent,
        undoLastKillerEvent
    }
})