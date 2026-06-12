import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import AppIcon from './components/ui/AppIcon.vue'

const app = createApp(App)

app.component('AppIcon', AppIcon)
app.use(createPinia())
app.use(router)

app.mount('#app')
