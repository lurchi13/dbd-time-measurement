import { createMemoryHistory, createRouter } from 'vue-router'

import GameSetup from './components/GameSetup.vue'
import RunningGame from './components/RunningGame.vue'

const routes = [
  { path: '/', component: GameSetup },
  { path: '/run', component: RunningGame },
]

export const router = createRouter({
  history: createMemoryHistory(),
  routes,
})