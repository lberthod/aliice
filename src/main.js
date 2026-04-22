import { createApp } from 'vue'
import App from './App.vue'
import './style.css'
import './styles-new.css'

createApp(App).mount('#app')

// Enregistre le service worker pour le cache hors-ligne des emojis.
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register(import.meta.env.BASE_URL + 'sw.js')
      .catch(err => console.warn('[sw] registration failed:', err))
  })
}
