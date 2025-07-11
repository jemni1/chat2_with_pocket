
import PocketBase from 'pocketbase'

const pb = new PocketBase('https://pocketbase-backend-4740.onrender.com') // ou ton URL déployée

if (typeof window !== 'undefined') {
  const stored = localStorage.getItem('pb_auth')
  if (stored) {
    try {
      const data = JSON.parse(stored)
      pb.authStore.save(data.token, data.model)
    } catch (e) {
      console.error('Erreur de parsing auth:', e)
    }
  }

  pb.authStore.onChange(() => {
    localStorage.setItem('pb_auth', JSON.stringify({
      token: pb.authStore.token,
      model: pb.authStore.model,
    }))
  })
}

export default pb
