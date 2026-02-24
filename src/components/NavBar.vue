<template>
    <div class="card">
        <Menubar :model="items" />
    </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";

import Menubar from 'primevue/menubar';

const router = useRouter()


const items = ref([
    {
        label: 'Measure Times',
        icon: 'pi pi-clock',
        items: [
            {
                label: 'Events', 
                icon: 'pi pi-clock',
                command: () => router.push('/measure/setup/game')
            },
            {
                label: 'Slug', 
                icon: 'pi pi-clock',
                command: () => router.push('/measure/setup/slug')
            }
        ]
    },
    {
        label: 'Brackets',
        icon: 'pi pi-star',
        command: () => router.push('/results')
    },
    {
        label: 'Settings',
        icon: 'pi pi-cog',
        items: [
            {
                label: "Teams",
                icon: "pi pi-users",
                command: () => router.push('/settings/teams')
            },
            {
                label: "Brackets",
                icon: "pi pi-th-large",
                command: () => router.push('/settings/brackets')
            },
            {
                label: "Games",
                icon: "pi pi-play",
                command: () => router.push('/settings/games')
            }
        ]
    }
]);
</script>