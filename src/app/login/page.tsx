'use client'

import { useState } from 'react'
import pb from '@/lib/pocketbase'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleLogin = async () => {
    try {
      await pb.collection('users').authWithPassword(email, password)

      console.log('✅ Session active ?', pb.authStore.isValid)
      console.log('👤 Utilisateur connecté :', pb.authStore.model)

      pb.authStore.save(pb.authStore.token, pb.authStore.model)

      router.push('/chat')
    } catch (err) {
    if (err instanceof Error) {
      setError(err.message)
    } else {
      setError('An unknown error occurred.')
    }
  }
  }

  return (
    <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-6 text-center">Connexion</h1>

      <input
        type="email"
        placeholder="Email"
        className="w-full mb-4 px-4 py-2 border rounded"
        value={email}
        onChange={e => setEmail(e.target.value)}
      />

      <input
        type="password"
        placeholder="Mot de passe"
        className="w-full mb-4 px-4 py-2 border rounded"
        value={password}
        onChange={e => setPassword(e.target.value)}
      />

      <button
        onClick={handleLogin}
        className="w-full py-2 bg-green-600 text-white rounded hover:bg-green-700"
      >
        Se connecter
      </button>

      {error && <p className="text-red-600 mt-4 text-center">{error}</p>}
    </div>
  )
}
