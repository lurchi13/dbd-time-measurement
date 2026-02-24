import { createWebHashHistory, createRouter } from 'vue-router'

import GameSetup from './components/GameSetup.vue'
import RunningGame from './components/RunningGame.vue'
import Brackets from './components/Brackets.vue'
import TeamSettings from './components/settings/TeamSettings.vue'
import BracketSettings from './components/settings/BracketSettings.vue'
import GameSettings from './components/settings/GameSettings.vue'
import Slugging from './components/Slugging.vue'

const routes = [
  { path: '/measure/setup/:mode', component: GameSetup },
  { path: '/measure/game', component: RunningGame },
  { path: '/measure/slug', component: Slugging},
  { path: '/results', component: Brackets},
  { path: '/settings/teams', component: TeamSettings},
  { path: '/settings/brackets', component: BracketSettings},
  { path: '/settings/games', component: GameSettings},
]

export const router = createRouter({
  history: createWebHashHistory(),
  routes,
})