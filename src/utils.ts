import type { EventType } from "./models/ProgressEvents"

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
