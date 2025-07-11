'use client'

import { useState } from 'react'
import pb from '@/lib/pocketbase'
import { useRouter } from 'next/navigation'

export default function SignupPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSignup = async () => {
    setError('')
    try {
      const data = {
        email,
        password,
        passwordConfirm: password,
      }

      const newUser = await pb.collection('users').create(data)
      console.log('✅ Utilisateur créé :', newUser)

      // Authentifier directement après l'inscription

      router.push('/login')
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
      <h1 className="text-2xl font-bold mb-6 text-center">Créer un compte</h1>

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
        onClick={handleSignup}
        className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        S’inscrire
      </button>

      {error && <p className="text-red-600 mt-4 text-center">{error}</p>}
    </div>
  )
}
