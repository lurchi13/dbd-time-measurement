interface BaseEvent {
    type: string
    eventTime: Date
}

export interface FirstHook extends BaseEvent {
    survivorId: number
    type: 'firstHook'
}

export interface SurvivorDead extends BaseEvent {
    survivorId: number
    type: 'dead'
}

export interface GenDone extends BaseEvent {
    index: number
    type: 'gen'
}

export interface HatchEscape extends BaseEvent {
    type: 'hatchEscape'
}

export interface ExitOpen extends BaseEvent {
    type: 'exitOpen'
}

export interface Escaped extends BaseEvent {
    survivorId: number
    type: 'escaped'
}

export type KillerEventType = FirstHook | SurvivorDead
export type SurvivorEventType = GenDone | HatchEscape | ExitOpen | Escaped
export type EventType = KillerEventType | SurvivorEventType