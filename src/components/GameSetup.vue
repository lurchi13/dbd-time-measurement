<script setup lang="ts">
import { computed, ref } from 'vue';
import type { Team } from '../models/Teams';
import Button from 'primevue/button'
import TeamSetup from './TeamSetup.vue';
import Message from 'primevue/message';
import { useTeamStore } from '../stores/teamStore';
import { useRouter } from 'vue-router';

const teamStore = useTeamStore()
const router = useRouter()

const killerTeam = ref<string>()
const killer = ref<number[]>([])

const survivorTeam = ref<string>()
const survivors = ref<number[]>([])

const errorMessage = computed(() => {
    const survivorCount = survivors.value.length
    let survivorMessage = ""
    if (survivorCount < 4){
        survivorMessage = "Less than 4 survivors"
    }
    else if (survivorCount > 4){
        survivorMessage = "More than 4 survivors"
    }

    const killerCount = killer.value.length
    let killerMessage = ""
    if (killerCount > 1) {
        killerMessage = "more than one killer"
    }
    else if (killerCount === 0){
        killerMessage = "no killer"
    }

    let errorMessage = ""
    if (survivorMessage && killerMessage){
        errorMessage = `${survivorMessage} and ${killerMessage} were selected`
    }
    else if (survivorMessage){
        errorMessage = `${survivorMessage} were selected`
    }
    else if (killerMessage){
        errorMessage = killerMessage.charAt(0).toUpperCase() + killerMessage.substring(1) + " was selected"
    }
    if (survivorTeam.value === killerTeam.value){
        if (errorMessage){
            errorMessage += " and different teams must be chosen"
        }
        else {
            errorMessage = "Different teams must be chosen"
        }
    }

    return errorMessage
})

function confirmChoices(){
    if (killerTeam.value === undefined){
        return
    }

    if (!killer.value[0]){
        return 
    }
    if (survivorTeam.value === undefined){
        return
    }

    teamStore.chooseKiller(killerTeam.value, killer.value[0])
    teamStore.chooseSurvivors(survivorTeam.value, survivors.value)
 
    router.push('/run')
}


function selectSurvivor(id: number) {
    survivors.value = [...survivors.value, id]
}

function changeSurvivorTeam(newSurvivorTeam: string | undefined){
    if (newSurvivorTeam !== survivorTeam.value){
        survivorTeam.value = newSurvivorTeam
        survivors.value = []
    }
}

function changeKillerTeam(newKillerTeam: string | undefined){
    if (newKillerTeam !== killerTeam.value){
        killerTeam.value = newKillerTeam
        killer.value = []
    }
}

function selectKiller(id: number){
    killer.value = [id]
}
</script>

<template>
    <div class="container">
        <TeamSetup title="Survivors" :selected-team="survivorTeam" @update:selected-team="changeSurvivorTeam" v-model:selected-members="survivors" @select-member="selectSurvivor"></TeamSetup>
        <TeamSetup title="Killer" :selected-team="killerTeam" @update:selected-team="changeKillerTeam" v-model:selected-members="killer" @select-member="selectKiller"></TeamSetup>
    </div>
    
    <Button :disabled="errorMessage.length > 0" label="Confirm Teams" @click="confirmChoices">
        <Message v-if="errorMessage.length > 0" severity="error" size="small" variant="simple">{{ errorMessage }}</Message>
    </Button>
    
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
