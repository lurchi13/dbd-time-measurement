import { defineStore } from "pinia"
import { computed, ref } from "vue"
import type { EventType } from "../models/ProgressEvents"
import type { TeamMember } from "../models/Teams"

export interface GameModel {
    gameId: string,
    gameStart: Date,
    endGameCollapse?: Date,
    gameEnd: Date
    killerTeam: string,
    survivorTeam: string,
    survivors: TeamMember[]
    events: EventType[]
}


export const useGameStore = defineStore('games', () => {
    const internalGames = ref({} as Record<string, GameModel>)

    function loadGame(newGame: GameModel){
        if (newGame.gameId){
            internalGames.value = {...internalGames.value, [newGame.gameId]: newGame}
        }
        else {
            console.warn("Game has no id and can not be imported")
        }
    }

    const games = computed(() => Object.values(internalGames.value))

    return {
        internalGames,
        loadGame,
        games
    }

})