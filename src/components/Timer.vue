<script setup lang="ts">
import { computed } from 'vue';
import { getTimeString } from '../utils';

const props = defineProps({
    startTime: {
        type: Date,
        required: true
    },
    endTime: {
        type: Date,
        required: true
    }
})

const timeString = computed(() => {
    const timeDiff = Math.abs(props.endTime.getTime() - props.startTime.getTime())
    return getTimeString(timeDiff)
})

</script>

<template>
    {{timeString}}
</template>

<style scoped>
</style>