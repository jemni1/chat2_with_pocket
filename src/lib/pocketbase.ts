// src/lib/pocketbase.ts
import PocketBase from 'pocketbase'

const pb = new PocketBase('http://127.0.0.1:8090') // ou ton URL PB

// Optionnel mais utile : réactiver la session depuis le localStorage
if (typeof window !== 'undefined') {
  const auth = localStorage.getItem('pocketbase_auth')
  if (auth) {
    const { token, model } = JSON.parse(auth)
    pb.authStore.save(token, model)
  }
}
pb.autoCancellation(false)
export default pb
