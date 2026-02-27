import { defineStore } from "pinia"
import { computed, ref } from "vue"
import type { EventType, SlugEventType } from "../models/ProgressEvents"
import type { EventTypes } from "../utils"

interface BasicInternalInformation {
    gameStart: Date,
    gameEnd: Date
    killerTeam: string,
    survivorTeam: string,
}

interface BasicGameInformation extends BasicInternalInformation {
    gameId: string
}

interface InternalGameVersions extends BasicInternalInformation {
    killer?: EventType[]
    survivors?: EventType[],
    slug?: SlugEventType[]
}

export enum FocusedSide {
    Killer = 'killer',
    Survivors = 'survivors'
}

export interface GameModel extends BasicGameInformation {
    endGameCollapse?: Date,
    events: EventType[],
    slugEvents?: SlugEventType[],
    customPenalty?: number,
    focusedSide: FocusedSide
    type: 'game'
}

export interface GameSlugModel extends BasicGameInformation {
    events: SlugEventType[]
    type: 'slug'
}


export const useGameStore = defineStore('games', () => {
    const internalGameVersions = ref({} as Record<string, InternalGameVersions>)
    const internalGames = ref({} as Record<string, GameModel>)

    function getBasicDetails(newGame: GameModel | GameSlugModel){
        return {gameStart: newGame.gameStart, gameEnd: newGame.gameEnd, killerTeam: newGame.killerTeam, survivorTeam: newGame.survivorTeam}
    }

    function getSide(type: EventTypes){
        switch(type){
            case "gen":
                return FocusedSide.Survivors
            case "exitOpen":
                return FocusedSide.Survivors
            case "escaped":
                return FocusedSide.Survivors
            case "hatchEscape":
                return FocusedSide.Survivors
            case "firstHook":
                return FocusedSide.Killer
            case "dead":
                return FocusedSide.Killer
        }
    }

    function extractEvents(newGame: GameModel, focusedSide: FocusedSide, gameStart?: Date){
        let correctTime: (time: Date) => Date
        if (gameStart){
            const milliSecondDelta = newGame.gameStart.getTime() - gameStart.getTime()
            correctTime = (time: Date) => new Date(time.getTime() - milliSecondDelta)
        }
        else {
            correctTime = (time: Date) => time
        }
        const returnEvents = [] as EventType[]
        newGame.events.forEach(event => {
            if (focusedSide === getSide(event.type)){
                returnEvents.push({...event, eventTime: correctTime(event.eventTime)})
            }
        })
        return returnEvents
    }

    function addGameVersion(newGame: GameModel, gameId?: string, gameStart?: Date){
        const focusedSide = newGame.focusedSide
        if (gameId && gameStart && internalGameVersions.value[gameId]){
            const events = extractEvents(newGame, focusedSide, gameStart)
            internalGameVersions.value[gameId][focusedSide] = events
            let otherSide
            if (focusedSide === FocusedSide.Killer){
                otherSide = FocusedSide.Survivors
            }
            else {
                otherSide = FocusedSide.Killer
            }
            const mergedEvents = [...events, ...(internalGameVersions.value[gameId][otherSide] || [])]
            const sortedEvents = mergedEvents.sort((a: EventType, b: EventType) => a.eventTime.getTime() - b.eventTime.getTime())
            if (internalGames.value[gameId]){
                internalGames.value[gameId].events = sortedEvents
            }
        }
        else {
            const newGameId = newGame.gameId
            internalGameVersions.value[newGameId] = {...getBasicDetails(newGame), [focusedSide]:  extractEvents(newGame, focusedSide)}
            internalGames.value[newGameId] = newGame
        }
    }

    function correctEventTimes(newGame: GameSlugModel, gameStart: Date){
        const milliSecondDelta = newGame.gameStart.getTime() - gameStart.getTime()
        const correctTime = (time: Date) => new Date(time.getTime() - milliSecondDelta)
        return newGame.events.map(event => ({...event, eventTime: correctTime(event.eventTime)}))
    }

    function addSlugVersion(newGame: GameSlugModel, gameId?: string, gameStart?: Date){
        if (gameId && gameStart && internalGameVersions.value[gameId]){
            const events = correctEventTimes(newGame, gameStart)
            internalGameVersions.value[gameId].slug = events
            if (internalGames.value[gameId]){
                internalGames.value[gameId].slugEvents = events
            }
        }
        else {
            const newGameId = newGame.gameId
            const basicDetails = getBasicDetails(newGame)
            internalGameVersions.value[newGameId] = {...basicDetails, slug: newGame.events} 
            internalGames.value[newGameId] = {...basicDetails, gameId: newGameId, slugEvents: newGame.events, events: [], focusedSide: FocusedSide.Killer, type: 'game'}
        }
    }

    function addAnyVersion(newGame: GameModel | GameSlugModel, gameId?: string, gameStart?: Date) {
        if (newGame.type === 'game'){
            addGameVersion(newGame, gameId, gameStart)
        }
        else {
            addSlugVersion(newGame, gameId, gameStart)
        }
    }

    function setCustomPenalty(gameId: string, customPenalty: number){
        if (internalGames.value[gameId]){
            internalGames.value[gameId].customPenalty = customPenalty
        }
    }

    function loadGameVersion(newGame: GameModel | GameSlugModel){
        const gameDetails = Object.entries(internalGameVersions.value).find(([_, game]) => game.gameStart < newGame.gameEnd && newGame.gameEnd > game.gameStart && newGame.killerTeam === game.killerTeam && newGame.survivorTeam === game.survivorTeam)

        if (gameDetails){
            const [gameId, game] = gameDetails
            addAnyVersion(newGame, gameId, game.gameStart)
            return
        }
        addAnyVersion(newGame)
    }

    function loadGame(newGame: GameModel){
        loadGameVersion(newGame)
    }

    const games = computed(() => Object.values(internalGames.value))

    return {
        internalGames,
        loadGame,
        setCustomPenalty,
        games
    }

})