"use client"

import { useEffect, useState } from "react"
import { onAuthStateChanged } from "firebase/auth"
import { auth } from "./config/firebase"
import { AuthProvider } from "./context/AuthContext"
import { ChatProvider } from "./context/ChatContext"
import { MessengerApp } from "./components/MessengerApp"

export default function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user)
      setLoading(false)
    })

    return unsubscribe
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <AuthProvider>
      <ChatProvider>
        <MessengerApp user={user} />
      </ChatProvider>
    </AuthProvider>
  )
}
