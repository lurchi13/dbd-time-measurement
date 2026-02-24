import { defineStore } from "pinia"
import { computed, ref } from "vue"
import type { SlugEventType } from "../models/ProgressEvents"
import { useTeamStore } from "./teamStore"
import { type GameSlugModel } from "./gameStore"
import { getTimeString } from "../utils"

export const useSlugStore = defineStore('slug', () => {
    const gameStart = ref(new Date())
    const currentGameTime = ref(new Date())
    const internalInterval = ref<number | null>(null)

    const internalSlugEvents = ref<Array<SlugEventType>>([])
    const internalSluggedSurvivors = ref({} as Record<number, Date | undefined>)
    const internalPickedUpSurvivor = ref<number | null>(null)
    const milliSecsBeforePause = ref<number>(0)

    function updateGameTime(){
        currentGameTime.value = new Date()
    }

    function startGame(){
        const teamStore = useTeamStore()

        if (!teamStore.ready){
            console.error("Could not start game, select teams first")
            return
        }

        gameStart.value = new Date()
        currentGameTime.value = gameStart.value
        internalInterval.value = setInterval(updateGameTime, 100)
        internalSlugEvents.value = []
        internalSluggedSurvivors.value = {}
        internalPickedUpSurvivor.value = null
        milliSecsBeforePause.value = 0
    }


    function stopGame(){
        if (internalInterval.value !== null){
            clearInterval(internalInterval.value)
            internalInterval.value = null

            const teamStore = useTeamStore()
            
            const gameId = crypto.randomUUID()

            const events = internalSlugEvents.value.sort((a: SlugEventType, b: SlugEventType) => a.eventTime.getTime() - b.eventTime.getTime())
            const exportJson: GameSlugModel = {
                gameId: gameId, 
                gameStart: gameStart.value,
                gameEnd: currentGameTime.value,
                killerTeam: teamStore.internalKillerTeam || "",
                // killerName: teamStore.killerName,
                survivorTeam: teamStore.survivorTeam || "",
                events: events,
                type: 'slug'
            }

            const json = JSON.stringify(exportJson, null, 2)

            const blob = new Blob([json], { type: 'application/json' })
            const url = URL.createObjectURL(blob)

            const a = document.createElement('a')
            a.href = url
            a.download = `${gameId}.json`
            a.click()

            URL.revokeObjectURL(url)
        }
    }

    function addEvent(type: 'slugStart' | 'slugPause' | 'slugEnd', survivorId: number){
        internalSlugEvents.value.push({type, survivorId, eventTime: currentGameTime.value})
    }

    function survivorDown(survivorId: number){
        addEvent('slugStart', survivorId)
        const time = currentGameTime.value
        if (internalPickedUpSurvivor.value === survivorId) {
            internalSluggedSurvivors.value[survivorId] = new Date(time.getTime() - milliSecsBeforePause.value)
            internalPickedUpSurvivor.value = null
        }
        else {
            internalSluggedSurvivors.value[survivorId] = time
        }
    }

    function survivorPickedUp(survivorId: number){
        addEvent('slugPause', survivorId)
        const time = currentGameTime.value
        const survivorSlugTime = internalSluggedSurvivors.value[survivorId]
        if (survivorSlugTime !== undefined){
            milliSecsBeforePause.value = time.getTime() - survivorSlugTime.getTime()
        }
        internalSluggedSurvivors.value[survivorId] = undefined
        
        internalPickedUpSurvivor.value = survivorId
    }

    function survivorNotOnGround(survivorId: number){
        addEvent('slugEnd', survivorId)
        if (internalPickedUpSurvivor.value === survivorId){
            milliSecsBeforePause.value = 0
            internalPickedUpSurvivor.value = null
        }
        internalSluggedSurvivors.value[survivorId] = undefined
    }

    const isRunning = computed(() => internalInterval.value !== null)
    const sluggedSurvivors = computed(() => internalSluggedSurvivors.value)
    const pickedUpSurvivor = computed(() => internalPickedUpSurvivor.value)
    const timeBeforePickUp = computed(() => getTimeString(milliSecsBeforePause.value ?? 0))

    return {
        gameStart,
        currentGameTime,
        startGame,
        stopGame,
        isRunning,
        sluggedSurvivors,
        pickedUpSurvivor,
        timeBeforePickUp,
        survivorDown,
        survivorPickedUp,
        survivorNotOnGround
    }
})