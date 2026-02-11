import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import PrimeVue from 'primevue/config'
import Aura from '@primeuix/themes/aura';
import { createPinia } from 'pinia';
import { router } from './router';


const pinia = createPinia()

const app = createApp(App)
app.use(PrimeVue, {
    theme: {
        preset: Aura
    }
})
app.use(pinia)
app.use(router)
app.mount('#app')
