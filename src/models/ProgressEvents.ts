interface BaseEvent {
    type: string
    eventTime: Date
}

interface EventWithSurvivorId extends BaseEvent {
    survivorId: number
}

export interface SlugStart extends EventWithSurvivorId {
    type: 'slugStart'
}

export interface SlugPause extends EventWithSurvivorId {
    type: 'slugPause'
}

export interface SlugEnd extends EventWithSurvivorId {
    type: 'slugEnd'
}

export interface FirstHook extends EventWithSurvivorId {
    type: 'firstHook'
}

export interface SurvivorDead extends EventWithSurvivorId {
    type: 'dead'
}

export interface GenDone extends BaseEvent {
    index: number
    type: 'gen'
}

export interface HatchEscape extends EventWithSurvivorId {
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
export type SlugEventType = SlugStart | SlugPause | SlugEnd
export type EventType = KillerEventType | SurvivorEventType