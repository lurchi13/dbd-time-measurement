<script setup lang="ts">
import Button from 'primevue/button';
import { computed } from 'vue';

const props = defineProps<{
    firstHook?: Date
    dead?: Date
}>()

const emit = defineEmits(['click'])

const buttonLabel = computed(() => props.firstHook !== undefined ? "Dead" : "First Hook" )

function buttonClicked() {
    emit('click')
}

</script>

<template>
    <Button :label="buttonLabel" @click="buttonClicked" severity="danger">

    </Button>
</template>

<style scoped>
</style>

