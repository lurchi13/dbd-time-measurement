import { createWebHashHistory, createRouter } from 'vue-router'

import GameSetup from './components/GameSetup.vue'
import RunningGame from './components/RunningGame.vue'
import Brackets from './components/Brackets.vue'
import TeamSettings from './components/settings/TeamSettings.vue'
import BracketSettings from './components/settings/BracketSettings.vue'
import GameSettings from './components/settings/GameSettings.vue'

const routes = [
  { path: '/measure/setup', component: GameSetup },
  { path: '/measure', component: RunningGame },
  { path: '/results', component: Brackets},
  { path: '/settings/teams', component: TeamSettings},
  { path: '/settings/brackets', component: BracketSettings},
  { path: '/settings/games', component: GameSettings},
]

export const router = createRouter({
  history: createWebHashHistory(),
  routes,
})