import { defineStore } from "pinia"
import { computed, ref } from "vue"

export interface MatchUp {
    firstTeam?: string
    secondTeam?: string
}


export type BracketSizes = '8' | '4' | '2'

export enum AvailableBrackets {
    QuarterFinals = '8',
    SemiFinals = '4',
    ThirdPlace = '3',
    Finals = '2'
}

export type MatchUpIndices = '0' | '1' | '2' | '3'
export enum MatchUpTeamKeys {
    FirstTeam = 'firstTeam',
    SecondTeam = 'secondTeam'
}

export type Bracket = Record<MatchUpIndices, MatchUp>
export type Brackets = Record<AvailableBrackets, Bracket>

export const useBracketStore = defineStore('brackets', () => {
    const internalBrackets = ref({} as Brackets)

    function bracketHasMatchUp(bracketSize: AvailableBrackets, matchUpIndex: MatchUpIndices){
        if (parseInt(matchUpIndex) > Math.floor(parseInt(bracketSize) / 2)){
            console.error("MatchUp does not exist for bracket")
            return false
        }
        return true
    }

    function getBracket(bracketSize: AvailableBrackets) {
        return brackets.value?.[bracketSize]
    }

    function getMatchUp(bracketSize: AvailableBrackets, matchUpIndex: MatchUpIndices){
        if (bracketHasMatchUp(bracketSize, matchUpIndex)){
            return getBracket(bracketSize)?.[matchUpIndex]
        }
    }

    function getTeam(bracketSize: AvailableBrackets, matchUpIndex: MatchUpIndices, teamKey: MatchUpTeamKeys){
        return getMatchUp(bracketSize, matchUpIndex)?.[teamKey]
    }

    function setBracket(bracketSize: AvailableBrackets, newBracket: Bracket){
        internalBrackets.value = {...internalBrackets.value, [bracketSize]: newBracket}
    }

    function setMatchUp(bracketSize: AvailableBrackets, matchUpIndex: MatchUpIndices, newMatchUp: MatchUp){
        if (bracketHasMatchUp(bracketSize, matchUpIndex)){
            const newBracket = {...(getBracket(bracketSize) || {}), [matchUpIndex]: newMatchUp}
            setBracket(bracketSize, newBracket)
        }
    }

    function setTeam(bracketSize: AvailableBrackets, matchUpIndex: MatchUpIndices, teamKey: MatchUpTeamKeys, newTeam: string | undefined){
        const newMatchUp = {...(getMatchUp(bracketSize, matchUpIndex) || {}), [teamKey]: newTeam}
        setMatchUp(bracketSize, matchUpIndex, newMatchUp)
    }

    function loadBrackets(newBrackets: Brackets){
        internalBrackets.value = newBrackets
    }

    const brackets = computed(() => internalBrackets.value)
    const hasBrackets = computed(() => Object.keys(internalBrackets.value).length > 0)

    return {
        internalBrackets,
        getBracket,
        getMatchUp,
        getTeam,
        setTeam,
        loadBrackets,
        brackets,
        hasBrackets
    }
})