<script setup lang="ts">
import { useBracketStore } from '../../stores/bracketStore';
import JSONUpload from '../JSONUpload.vue';
import { Card } from 'primevue';

const bracketStore = useBracketStore()
</script>

<template>
    <Card>
        <template #title>Upload Brackets</template>
        <template #content>
            <JSONUpload upload-label="Select Brackets" :multiple="false" @json-loaded="bracketStore.loadBrackets">
            </JSONUpload>
        </template>
    </Card>
</template>

<style scoped>
</style>
