<script setup lang="ts">
import { computed } from 'vue';
import { useTeamStore } from '../stores/teamStore';
import TeamUpload from './settings/TeamUpload.vue';

const teamStore = useTeamStore()

const hasTeams = computed(() => teamStore.hasTeams)

</script>

<template>
    <template v-if="hasTeams">
        <slot/>
    </template>
    <template v-else>
        Please upload your Teams from a JSON file:
        <TeamUpload/>
    </template>

</template>

<style scoped>
.container {
  display: flex;
  gap: 16px;
}

.container > * {
  flex: 1;
}
</style>
