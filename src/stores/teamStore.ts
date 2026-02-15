import { defineStore } from "pinia"
import { computed, ref } from "vue"
import type { Team, TeamMember } from "../models/Teams"

export const useTeamStore = defineStore('teams', () => {
    const teams = ref<Team[]>([])
    console.log(JSON.stringify(teams.value))
    const internalKillerTeam = ref<string>()
    const internalKiller = ref<number>()
    const internalSurvivorTeam = ref<string>()
    const internalSurvivors = ref<number[]>()

    const hasTeams = computed(() => teams.value.length > 0)

    function loadTeams(newTeams: Team[]){
        teams.value = newTeams
    }

    function getTeam(teamName: string) : Team | undefined{
        return teams.value.find(team => team.name === teamName)
    }


    function getTeamMember(teamName: string, memberId: number): TeamMember | undefined{
        const team = getTeam(teamName)
        if (team === undefined){
            console.log("Team not found!")
            return 
        }

        return team.members.find(member => member.id === memberId)
    }

    function addTeamMember(teamName: string, newMember: string): number | undefined {
        const newId = Math.max(...teams.value.flatMap(team => team.members.map(member => member.id))) + 1
        const team = getTeam(teamName)
        if (team === undefined){
            console.log("Team not found!")
            return 
        }
        team.members = [...team.members, {id: newId, name: newMember}]
         teams.value = [...teams.value]
        return newId
    }

    function renameTeamMember(teamName: string, memberId: number, newName: string){
        const member = getTeamMember(teamName, memberId)
        if (member === undefined){
            console.error("Member not found!")
            return
        }
        
        member.name = newName
        teams.value = [...teams.value]
    }

    function checkTeamExists(teamName: string): boolean {
        const team = getTeam(teamName)
        return team !== undefined
    }

    function checkTeamMemberExists(teamName: string, memberId: number): boolean {
        const member = getTeamMember(teamName, memberId)
        return member !== undefined
    }

    function chooseKiller(teamName: string, memberId: number): boolean{
        if (!checkTeamMemberExists(teamName, memberId)){
            return false
        }
        internalKillerTeam.value = teamName
        internalKiller.value = memberId
        return true
    }

    function chooseSurvivors(teamName: string, memberIds: number[]): boolean{
        if (memberIds.length !== 4){
            console.error("4 Survivors must be selected!")
            return false
        }
        if (!memberIds.every(memberId => checkTeamMemberExists(teamName, memberId))) {
            console.error("Not all members exist in the team!")
            return false
        }
        internalSurvivorTeam.value = teamName
        internalSurvivors.value = [...memberIds]
        return true
    }

    const survivorTeam = computed(() => {
        return internalSurvivorTeam.value
    })

    const survivorIds = computed(() => {
        return internalSurvivors.value ?? []
    })

    const survivors = computed((): TeamMember[] => {
        const teamInformation = teams.value.find(team => team.name === internalSurvivorTeam.value)

        console.log(teamInformation)

        if (teamInformation === undefined){
            return []
        }

        console.log(teamInformation.members.filter(member => survivorIds.value?.includes(member.id)))

        return teamInformation.members.filter(member => survivorIds.value?.includes(member.id)) ?? []
    })

    const killerId = computed(() => {
        return internalKiller.value
    })

    const ready = computed(() => {
        return internalSurvivorTeam.value && internalKillerTeam.value && internalKiller.value && internalSurvivors.value?.length === 4
    })

    return {
        teams,
        internalKillerTeam,
        internalKiller,
        survivorTeam,
        survivorIds,
        survivors,
        killerId,
        ready,
        hasTeams,
        loadTeams,
        getTeam,
        getTeamMember,
        checkTeamExists,
        checkTeamMemberExists,
        addTeamMember,
        renameTeamMember,
        chooseKiller,
        chooseSurvivors
    }

})