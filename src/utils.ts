import type { EventType } from "./models/ProgressEvents"

export function getTimeString(timeDiff: number){
    const minutes = Math.floor(timeDiff / 60000)
    const seconds = Math.floor(timeDiff / 1000 % 60)
    const milliseconds = Math.floor(timeDiff % 1000) 
    let timeString = `${seconds}.${milliseconds}`
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

export function getEvaluation(gameStart: Date, lastEvent: Date, missingEvents: number, sectionId: number): EventRow[] {
    const section = {id: sectionId, label: 'Evaluation'} as SectionType
    const totalEventTime = lastEvent.getTime() - gameStart.getTime()
    const averageEventTime = totalEventTime / (8 - missingEvents)
    const missingPenalty = missingEvents * 30000
    const finalAverageEventTime = averageEventTime + missingPenalty
    return [
        getStringEvent(section, "Average Event Time", getTimeString(averageEventTime)),
        getStringEvent(section, "Missing Event Count", missingEvents.toString()),
        getStringEvent(section, "Penalty", getTimeString(missingPenalty)),
        getStringEvent(section, "Average Event Time", getTimeString(finalAverageEventTime))
    ]
}
