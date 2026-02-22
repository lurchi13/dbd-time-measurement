<script setup lang="ts">
import { computed } from 'vue';
import { useBracketStore } from '../stores/bracketStore';
import RequiresTeams from './RequiresTeams.vue';
import BracketUpload from './settings/BracketUpload.vue';

const bracketStore = useBracketStore()

const hasBrackets = computed(() => bracketStore.hasBrackets)
</script>

<template>
    <RequiresTeams>
        <template v-if="hasBrackets">
            <slot/>
        </template>
        <template v-else>
            Please upload your Brackets from a JSON file:
            <BracketUpload/>
        </template>
    </RequiresTeams>
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
