import type { EventType, KillerEventType, SlugEventType } from "./models/ProgressEvents"

export function formatDate(inputDate: Date){
    return inputDate.toLocaleString()
}

export function getTimeString(timeDiff: number){
    const minutes = Math.floor(timeDiff / 60000)
    const seconds = Math.floor(timeDiff / 1000 % 60)
    const milliseconds = Math.floor(timeDiff % 1000) 
    let timeString = `${seconds.toString().padStart(2, "0")}.${milliseconds.toString().padStart(3, "0")}`
    if (minutes > 0) {
        timeString = `${minutes}:${timeString}`
    }
    return timeString
}

export interface DateRow {
    referenceTime: Date,
    eventTime: Date
}

export interface KillerEventRow {
    firstHook?: DateRow,
    dead?: DateRow
}

export function getKillerEventLookup(gameStart: Date, events: EventType[]){
    const killerEvents: Record<number, KillerEventRow> = {}
    let lastEvent: Date = gameStart

    events.forEach((event: EventType) => {
        if (event.type !== 'firstHook' && event.type !== 'dead'){
            return
        }
        if (!(event.survivorId in killerEvents)){
            killerEvents[event.survivorId] = {}
        }
        const survivorEvents = killerEvents[event.survivorId]
        if (survivorEvents === undefined){
            console.error("Survivor is not in killerEvents")
            return
        }
        survivorEvents[event.type] = {referenceTime: lastEvent, eventTime: event.eventTime }
        lastEvent = event.eventTime
    })
    return killerEvents
}

export type SectionType = {id: number, label: string}
export type EventRowType = 'timer' | 'string' | 'none'
export type EventRow = {type: EventRowType, section: SectionType, label: string, referenceTime?: Date, eventTime?: Date, value?: string}
export type EventTypes = 'gen' | 'exitOpen' | 'escaped' | 'hatchEscape' | 'firstHook' | 'dead'

export function getOptionalTimerEvent(section: SectionType, label: string, referenceTime: Date, eventTime: Date | undefined){
    return eventTime ? getTimerEvent(section, label, referenceTime, eventTime) : getEmptyEvent(section, label)
}

export function getTimerEvent(section: SectionType, label: string, referenceTime: Date, eventTime: Date): EventRow {
    return {section, label, type: 'timer', referenceTime, eventTime}
}

export function getEmptyEvent(section: SectionType, label: string): EventRow {
    return{section, label, type: 'none'}
}

export function getStringEvent(section: SectionType, label: string, value: string): EventRow {
    return {section, label, value, type: 'string'}
}

export function getGameDetails(gameStart: Date, endGameCollapse: Date | undefined, gameEnd: Date | undefined): EventRow[] {
    const gameDetailsSection = {id: 1, label: 'Game Information'}
    return [
        getOptionalTimerEvent(gameDetailsSection, "Endgame Collapse", gameStart, endGameCollapse),
        getOptionalTimerEvent(gameDetailsSection, "Game Time", gameStart, gameEnd)
    ]
}

export interface EvaluationModel {
    averageEventTime: number,
    missingEvents: number,
    missingPenalty: number,
    totalAverageEventTime: number
}

export interface GameEvaluationModel {
    killer: EvaluationModel,
    survivors: EvaluationModel,
    firstGen?: number
    firstHook?: number
}

export function processGameProgress(gameStart: Date, gameEnd: Date, events: EventType [], eventCallback: (eventType: EventTypes, lastEvent: Date, eventTime: Date, relevantId?: number) => void, missingEventCallback: (eventType: EventTypes, relevantId?: number) => void, slugEvents?: SlugEventType[]): GameEvaluationModel{
    let lastSurvivorEvent = gameStart
    let genCount = 0
    let escapeCount = 0
    let missingSurvivorEvents = 0
    let gatesOpen = false
    let lastKillerEvent: Date = gameStart
    let hookedSurvivors = 0
    let killedSurvivors = 0
    let firstGen: undefined | number = undefined 
    let firstHook: undefined | number = undefined
    let downedSurvivorCount: number = 0
    let downedCountdownStart: Date | undefined = undefined
    let millisecondsBeforePickup = 0
    let pickedUpSurvivor: undefined | number
    let slugPenalty = 0
    let slugOffset = 30000

    let mergedEvents
    if (slugEvents){
        mergedEvents = [...events, ...slugEvents]
    }
    else {
        mergedEvents = [...events]
    }
    const sortedEvents = mergedEvents.sort((a: SlugEventType | EventType, b: SlugEventType | EventType) => a.eventTime.getTime() - b.eventTime.getTime())

    const addSurvivorEvent =(event: EventType, relevantId?: number) => {
        const eventTime = event.eventTime
        eventCallback(event.type, lastSurvivorEvent, event.eventTime, relevantId)
        lastSurvivorEvent = eventTime
    }

    const addMissingSurvivorEvent = (eventType: EventTypes, relevantid?: number) => {
        missingSurvivorEvents++
        missingEventCallback(eventType, relevantid)
    }

    const addKillerEvent = (event: KillerEventType) => {
        eventCallback(event.type, lastKillerEvent, event.eventTime, event.survivorId)
        lastKillerEvent = event.eventTime
    }

    const addMissingGenEvents = () => {
        if (genCount === 5){
            return
        }

        for (let i = genCount + 1; i < 6; i++){
            addMissingSurvivorEvent('gen', i)
        }
    }

    const checkEnoughDownedSurvivors = () => {
        if (downedSurvivorCount === 4 - escapeCount - killedSurvivors){
            return false
        }
        if (downedSurvivorCount >= 2){
            return true
        }
        if (downedSurvivorCount === 1 && escapeCount === 0 && killedSurvivors === 2){
            return true
        }
        return false
    }

    const checkReducedCountChangesState = () => {
        const priorFulfilled = checkEnoughDownedSurvivors()
        --downedSurvivorCount
        const nowFulfilled = checkEnoughDownedSurvivors()
        return priorFulfilled && !nowFulfilled
    }

    const addSlugPenalty = (endTime: Date) => {
        if (downedCountdownStart) {
            const downedTime = endTime.getTime() - downedCountdownStart.getTime()
            if (downedTime > slugOffset) {
                slugPenalty += (downedTime - slugOffset) * 5
            }
        }
    }

    const handleSlugEnd = (eventTime: Date) => {
        if (!checkReducedCountChangesState()){
            return
        }
        addSlugPenalty(eventTime)
        downedCountdownStart = undefined
        millisecondsBeforePickup = 0
    }

    sortedEvents.forEach(event => {
        switch(event.type){
            case 'gen':
                if (firstGen === undefined) {
                    firstGen = event.eventTime.getTime() - gameStart.getTime() 
                }
                genCount++
                addSurvivorEvent(event, event.index)
                break
            case 'exitOpen':
                addMissingGenEvents()
                addSurvivorEvent(event)
                gatesOpen = true
                break
            case 'hatchEscape':
                if (!gatesOpen){
                    addMissingGenEvents()
                    addSurvivorEvent(event)
                }
                if (++escapeCount % 2 == 0){
                    addSurvivorEvent({...event, type: 'escaped'}, escapeCount)
                }
                break
            case 'escaped':
                if (++escapeCount % 2 == 0){
                    addSurvivorEvent(event, escapeCount)
                }
                break
            case 'firstHook':
                if (firstHook === undefined){
                    firstHook = event.eventTime.getTime() - gameStart.getTime()
                }
                hookedSurvivors++
                addKillerEvent(event)
                break
            case 'dead': {
                const priorFulfilled = checkEnoughDownedSurvivors()
                killedSurvivors++
                const nowFulfilled = checkEnoughDownedSurvivors()
                let changeSlugOffset = killedSurvivors == 2
                if (changeSlugOffset){
                    slugOffset = 15000
                }
                if (priorFulfilled){
                    if (!changeSlugOffset){
                        return
                    }
                    if (downedCountdownStart){
                        const fulfillTime = event.eventTime.getTime() - downedCountdownStart.getTime()
                        if (fulfillTime < 30000){
                            slugOffset = fulfillTime
                        }

                    }
                    return
                }
                if (nowFulfilled){
                    downedCountdownStart = event.eventTime
                }
                addKillerEvent(event)
                break
            }
            
            case "slugStart": {
                const priorFulfilled = checkEnoughDownedSurvivors()
                ++downedSurvivorCount
                const nowFulfilled = checkEnoughDownedSurvivors()
                if (priorFulfilled){
                    if (pickedUpSurvivor !== event.survivorId){
                        return
                    }
                    if (downedCountdownStart){
                        downedCountdownStart = new Date(downedCountdownStart?.getTime() - millisecondsBeforePickup)
                        millisecondsBeforePickup = 0
                        pickedUpSurvivor = undefined
                    }
                    return
                }
                if (!nowFulfilled){
                    return
                }

                if (pickedUpSurvivor === event.survivorId){
                    downedCountdownStart = new Date(event.eventTime.getTime() - millisecondsBeforePickup)
                    millisecondsBeforePickup = 0
                    pickedUpSurvivor = undefined
                    return
                }
                downedCountdownStart = event.eventTime
                break
            }
            case "slugPause": {
                if (!checkReducedCountChangesState()){
                    return
                }
                if (downedCountdownStart !== undefined){
                    millisecondsBeforePickup = event.eventTime.getTime() - downedCountdownStart.getTime()
                }
                pickedUpSurvivor = event.survivorId
                break
            }
            case "slugEnd": {
                handleSlugEnd(event.eventTime)
            }
        }
    })
    if (checkEnoughDownedSurvivors()){
        addSlugPenalty(gameEnd)
    }

    if (genCount < 5 && missingSurvivorEvents === 0){
        addMissingGenEvents()
    }
    if (!gatesOpen){
        if (escapeCount === 0){
            missingSurvivorEvents++
        }
        missingEventCallback('exitOpen')
    }
    if (escapeCount < 2){
        addMissingSurvivorEvent('escaped', 2)
    }
    if (escapeCount < 4){
        addMissingSurvivorEvent('escaped', 4)
    }

    return {
        survivors: getEvaluationTmp(gameStart, lastSurvivorEvent, missingSurvivorEvents),
        killer: getEvaluationTmp(gameStart, lastKillerEvent, 8 - (hookedSurvivors +  killedSurvivors), slugPenalty),
        firstGen,
        firstHook
    }
}

function getEvaluationTmp(gameStart: Date, lastEvent: Date, missingEvents: number, slugPenalty?: number) : EvaluationModel {
    const totalEventTime = lastEvent.getTime() - gameStart.getTime()
    const completedEvents = 8 - missingEvents
    let averageEventTime: number
    let missingPenalty: number
    
    if (completedEvents <= 0){
        averageEventTime = 0
        missingPenalty = 900000
    }
    else {
        averageEventTime = totalEventTime / completedEvents
        missingPenalty = missingEvents * 20000
    }
    missingPenalty += slugPenalty ?? 0
    
    const totalAverageEventTime = averageEventTime + missingPenalty
    return {
        averageEventTime,
        missingEvents,
        missingPenalty,
        totalAverageEventTime,
    }
}

export function getEvaluation(gameStart: Date, lastEvent: Date, missingEvents: number): EventRow[] {
    const section = {id: 10, label: 'Evaluation'} as SectionType
    const totalEventTime = lastEvent.getTime() - gameStart.getTime()
    const completedEvents = 8 - missingEvents
    let averageEventTime: number
    let missingPenalty: number
    let averageEventTimeEvent: EventRow
    if (completedEvents <= 0){
        averageEventTime = 0
        missingPenalty = 900000
                averageEventTimeEvent = getEmptyEvent(section, "Average Event Time")
    }
    else {
        averageEventTime = totalEventTime / completedEvents
        missingPenalty = missingEvents * 30000
        averageEventTimeEvent = getStringEvent(section, "Average Event Time", getTimeString(averageEventTime))
    }
    
    const finalAverageEventTime = averageEventTime + missingPenalty
    return [
        averageEventTimeEvent,
        getStringEvent(section, "Missing Event Count", missingEvents.toString()),
        getStringEvent(section, "Penalty", getTimeString(missingPenalty)),
        getStringEvent(section, "Average Event Time", getTimeString(finalAverageEventTime))
    ]
}
