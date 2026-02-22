<script setup lang="ts">
import { computed, ref } from 'vue';
import Card from 'primevue/card'
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button'
import { InputText } from 'primevue';
import { type DataTableCellEditCompleteEvent } from 'primevue/datatable';
import { useTeamStore } from '../../stores/teamStore';
import TeamUpload from './TeamUpload.vue';

const teamStore = useTeamStore()

const emit = defineEmits(['selectMember'])

const expandedRows = ref([])
const teams = computed(() => teamStore.teams)

const teamsWithAddedMember = ref<string[]>([])

const teamsWithMembers = computed(() => {
    return teams.value.map(team => {
        if (teamHasAddedMember(team.name)) {
            return {...team, members: [...team.members, {name: "Enter name...", id: undefined}]}
        }
        return team
    })
}
)

function teamHasAddedMember(teamName: string){
    return teamsWithAddedMember.value.includes(teamName)
}

function editTeamMember(event: DataTableCellEditCompleteEvent, teamName: string){
    let { data, newValue } = event; 

    if (data.id === undefined){
        teamStore.addTeamMember(teamName , newValue)
        teamsWithAddedMember.value = teamsWithAddedMember.value.filter(team => team !== teamName)
        return
    }

    teamStore.renameTeamMember(teamName, data.id, newValue)
}

function addTeamMember(teamName: string) {
    if (teamHasAddedMember(teamName)){
        return
    }
    teamsWithAddedMember.value = [...teamsWithAddedMember.value, teamName]
}
</script>

<template>
    <Card>
        <template #title>ManageTeams</template>
        <template #content>
            <DataTable v-model:expanded-rows="expandedRows" :value="teamsWithMembers" data-key="name">
                <Column expander style="width: 5rem" />
                <Column field="name" header="Team-Name"/>
                <template #expansion="slotProps">
                <div class="p-4">
                    <h5>Team-Members</h5>
                    <DataTable :value="slotProps.data.members" editMode="cell" @cell-edit-complete="editTeamMember($event, slotProps.data.name)">
                    <Column field="name" header="Team-Member">
                        <template #editor="{ data, field }">
                            <InputText v-model="data[field]" fluid/>
                        </template>
                    </Column>
                    <template #footer>
                        <Button v-if="!teamHasAddedMember(slotProps.data.name)" label="Add member" @click="addTeamMember(slotProps.data.name)">
                        </Button>
                    </template>
                </DataTable>
                </div>
                </template>
            </DataTable>
        </template>
    </Card>
    <TeamUpload/>
</template>

<style scoped>
</style>
