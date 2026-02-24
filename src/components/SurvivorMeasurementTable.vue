<script setup lang="ts">
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import { useTeamStore } from '../stores/teamStore';
import { type DataTableCellEditCompleteEvent } from 'primevue/datatable';
import InputText from 'primevue/inputtext'

defineProps<{
    tableData: {survivorName: string}[]
}>()

const teamStore = useTeamStore()

function editTeamMember(event: DataTableCellEditCompleteEvent){
    let { data, newValue } = event; 
    
    if (teamStore.survivorTeam === undefined){
        return
    }

    teamStore.renameTeamMember(teamStore.survivorTeam, data.survivorId, newValue)
}

</script>

<template>
    <DataTable :value="tableData" editMode="cell" @cell-edit-complete="editTeamMember">
        <Column field="survivorName" header="Survivor Name">
            <template #editor="{ data, field }">
                <InputText v-model="data[field]" fluid/>
            </template>
        </Column>
        <slot name="columns"/>
    </DataTable>
    <slot name="buttons"/>
</template>

<style scoped>
</style>
