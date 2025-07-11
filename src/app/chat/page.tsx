'use client'

import { useEffect, useState } from 'react'
import pb from '@/lib/pocketbase'
import type { RecordSubscription } from 'pocketbase'
import { useRouter } from 'next/navigation'

interface Message {
  id: string
  content: string
  sender_id: string
  receiver_id: string
  created: string
}

export default function ChatPage() {
  const [userId, setUserId] = useState<string | null>(null)
  const [receiverId, setReceiverId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const router = useRouter()

  // 1. Obtenir l'utilisateur connecté et l'autre utilisateur
  useEffect(() => {
    const user = pb.authStore.model
    if (!pb.authStore.isValid || !user) {
      router.push('/login')
    } else {
      setUserId(user.id)
      pb.collection('users')
        .getFullList({ sort: '-created' }) // récupérer tous les users
        .then(users => {
          const otherUser = users.find(u => u.id !== user.id)
          if (otherUser) setReceiverId(otherUser.id)
        })
    }
  }, [])

  // 2. Charger les messages initiaux entre les deux utilisateurs
  useEffect(() => {
    if (!userId || !receiverId) return

    const fetchMessages = async () => {
      const result = await pb.collection('messages').getFullList<Message>({
        filter: `(
          (sender_id='${userId}' && receiver_id='${receiverId}') ||
          (sender_id='${receiverId}' && receiver_id='${userId}')
        )`,
        sort: 'created',
      })

      setMessages(result)
    }

    fetchMessages()
  }, [userId, receiverId])

  // 3. Abonnement temps réel aux nouveaux messages
  useEffect(() => {
    if (!userId || !receiverId) return

    const handler = (e: RecordSubscription<Message>) => {
      const msg = e.record

      const isBetweenUsers =
        (msg.sender_id === userId && msg.receiver_id === receiverId) ||
        (msg.sender_id === receiverId && msg.receiver_id === userId)

      if (isBetweenUsers) {
        setMessages(prev => [...prev, msg])
      }
    }

    let unsubscribe: (() => void) | undefined

    pb.collection('messages').subscribe('*', handler).then((unsub) => {
      unsubscribe = unsub
    })

    return () => {
      if (unsubscribe) unsubscribe()
    }
  }, [userId, receiverId])

  // 4. Envoyer un message
  const sendMessage = async () => {
    if (!newMessage || !userId || !receiverId) return

    await pb.collection('messages').create({
      sender_id: userId,
      receiver_id: receiverId,
      content: newMessage,
    })

    setNewMessage('')
    // Pas besoin de recharger les messages manuellement car temps réel est actif
  }

  const handleLogout = () => {
    pb.authStore.clear()
    localStorage.removeItem('pb_auth')
    document.cookie = 'pb_auth=; Max-Age=0; path=/;';
    router.push('/login')
  }
  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded shadow">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Discussion privée</h1>
        <button onClick={handleLogout} className="text-red-600 hover:underline">Se déconnecter</button>
      </div>

      <div className="h-80 overflow-y-auto mb-4 border p-4 rounded bg-gray-100">
        {messages.map(msg => (
          <div key={msg.id} className={`mb-2 ${msg.sender_id === userId ? 'text-right text-blue-700' : 'text-left text-gray-800'}`}>
            <span className="inline-block bg-white px-4 py-2 rounded shadow">{msg.content}</span>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <input type="text" value={newMessage} onChange={e => setNewMessage(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMessage()} className="flex-grow px-4 py-2 border rounded" placeholder="Votre message..." />
        <button onClick={sendMessage} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Envoyer</button>
      </div>
    </div>
  )
}