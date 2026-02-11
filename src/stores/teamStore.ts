import { defineStore } from "pinia"
import { computed, ref } from "vue"
import type { Team, TeamMember } from "../models/Teams"

export const useTeamStore = defineStore('teams', () => {
    const teams = ref<Team[]>([
        {
            name: "Sables",
            members: [
                {id: 1, name: "A"},
                {id: 2, name: "B"},
                {id: 3, name: "C"},
                {id: 4, name: "D"},
                {id: 5, name: "E"},
            ]
        },
        {
            name: "Woods",
            members: [
                {id: 6, name: "F"},
                {id: 7, name: "G"},
                {id: 8, name: "H"},
                {id: 9, name: "I"},
                {id: 10, name: "J"},
            ]
        }
    ])
    const killerTeam = ref<string>()
    const killer = ref<number>()
    const survivorTeam = ref<string>()
    const survivors = ref<number[]>()

    function getTeam(teamName: string) : Team | undefined{
        return teams.value.find(team => team.name === teamName)
    }

    function getTeamMember(teamName: string, memberId: number): TeamMember | undefined{
        const team = getTeam(teamName)
        if (team === undefined){
            console.log("Team not found!")
            return 
        }

        return team.members.find(member => member.id = memberId)
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
        killerTeam.value = teamName
        killer.value = memberId
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
        survivorTeam.value = teamName
        survivors.value = [...memberIds]
        return true
    }

    const survivorNames = computed(() => {
        if (survivorTeam.value === undefined){
            return []
        }

        const team = getTeam(survivorTeam.value)
        if (team === undefined){
            return []
        }
        return team.members.filter(member => survivors.value?.includes(member.id)).map(member => member.name)

    })

    return {
        teams,
        killerTeam,
        killer,
        survivorTeam,
        survivors,
        getTeam,
        getTeamMember,
        checkTeamExists,
        checkTeamMemberExists,
        addTeamMember,
        renameTeamMember,
        chooseKiller,
        chooseSurvivors,
        survivorNames
    }

})