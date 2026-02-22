<script setup lang="ts">
import Card from 'primevue/card'
import { useTeamStore } from '../../stores/teamStore';
import JSONUpload from '../JSONUpload.vue';

const teamStore = useTeamStore()
</script>

<template>
    <Card>
        <template #title>Upload Teams</template>
        <template #content>
            <JSONUpload upload-label="Select Teams" :multiple="false" @json-loaded="teamStore.loadTeams">
            </JSONUpload>
        </template>
    </Card>
</template>

<style scoped>
</style>
