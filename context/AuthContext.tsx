"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { onAuthStateChanged, type User } from "firebase/auth"
import { doc, setDoc, getDoc } from "firebase/firestore"
import { auth, db } from "../config/firebase"

interface AuthContextType {
  user: User | null
  userProfile: any
  loading: boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  loading: true,
})

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    try {
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        setUser(user)

        if (user) {
          try {
            // Get or create user profile
            const userDoc = await getDoc(doc(db, "users", user.uid))
            if (userDoc.exists()) {
              setUserProfile(userDoc.data())
            } else {
              // Create new user profile
              const newProfile = {
                uid: user.uid,
                email: user.email,
                displayName: user.displayName || user.email?.split("@")[0],
                photoURL: user.photoURL || null,
                isOnline: true,
                lastSeen: new Date(),
              }
              await setDoc(doc(db, "users", user.uid), newProfile)
              setUserProfile(newProfile)
            }
          } catch (error) {
            console.error("Error handling user profile:", error)
          }
        } else {
          setUserProfile(null)
        }

        setLoading(false)
      })

      return unsubscribe
    } catch (error) {
      console.error("Error setting up auth listener:", error)
      setLoading(false)
    }
  }, [])

  return <AuthContext.Provider value={{ user, userProfile, loading }}>{children}</AuthContext.Provider>
}
