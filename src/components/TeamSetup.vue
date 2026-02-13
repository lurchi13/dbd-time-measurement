<script setup lang="ts">
import { computed, ref } from 'vue';
import Select from 'primevue/select'
import Card from 'primevue/card'
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Checkbox from 'primevue/checkbox';
import Button from 'primevue/button'
import { InputText } from 'primevue';
import { type DataTableCellEditCompleteEvent } from 'primevue/datatable';
import { useTeamStore } from '../stores/teamStore';

const teamStore = useTeamStore()

const props = defineProps({
    title: {
        type: String,
        required: true
    }
})

const emit = defineEmits(['selectMember'])

const selectedTeam = defineModel<string | undefined>("selectedTeam", {required: true})
const selectedMembers = defineModel("selectedMembers", {type: Array<number>, required: true})

const addedMember = ref<boolean>(false)
const teamMembers = computed(() => {
        if (!selectedTeam.value){
            return []
        }
        
        const team = teamStore.getTeam(selectedTeam.value)

        if (team === undefined){
            return []
        }

        if (addedMember.value){
            return [...team.members, {name: "Enter name...", id: undefined}]
        }
        return team.members
    }
)


function isSelected(id: number) {
    return selectedMembers.value.includes(id)
}

function changeSelection(id: number | undefined){
    if (id === undefined){
        return 
    }

    if (isSelected(id)){
        selectedMembers.value = [...selectedMembers.value.filter(rowId => rowId !== id)]
    }
    else {
        emit("selectMember", id)
    }
}

function editTeamMember(event: DataTableCellEditCompleteEvent){
    let { data, newValue } = event; 
    
    if (selectedTeam.value === undefined){
        return
    }

    if (data.id === undefined){
        teamStore.addTeamMember(selectedTeam.value , newValue)
        addedMember.value = false
        return
    }

    teamStore.renameTeamMember(selectedTeam.value, data.id, newValue)
}

function addTeamMember() {
    addedMember.value = true
}
</script>

<template>
    <Card>
        <template #title>{{title}}</template>
        <template #content>
            <Select :options="teamStore.teams" option-value="name" option-label="name" v-model="selectedTeam">

            </Select>
            <br/>
            <template v-if="selectedTeam">
                <DataTable :value="teamMembers" editMode="cell" @cell-edit-complete="editTeamMember">
                    <Column field="name" header="Team-Member">
                        <template #editor="{ data, field }">
                            <InputText v-model="data[field]" fluid/>
                        </template>
                    </Column>
                    <Column header="Participates">
                        <template #body="slotProps">
                            <Checkbox v-if="slotProps.data.id" :model-value="isSelected(slotProps.data.id)" @update:model-value="changeSelection(slotProps.data.id)" binary></Checkbox>
                        </template>
                    </Column>
                    <template #footer>
                        <Button v-if="!addedMember" label="Add member" @click="addTeamMember">
                        </Button>
                    </template>
                </DataTable>
            </template>
        </template>
    </Card>
</template>

<style scoped>
</style>
