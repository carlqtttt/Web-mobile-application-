"use client"

import { useEffect, useState } from "react"
import { Platform } from "react-native"

// Only import navigation on native platforms
let NavigationContainer, createStackNavigator, createBottomTabNavigator
let StatusBar, Ionicons

if (Platform.OS !== "web") {
  const navigation = require("@react-navigation/native")
  const stack = require("@react-navigation/stack")
  const tabs = require("@react-navigation/bottom-tabs")
  const expo = require("expo-status-bar")
  const icons = require("@expo/vector-icons")

  NavigationContainer = navigation.NavigationContainer
  createStackNavigator = stack.createStackNavigator
  createBottomTabNavigator = tabs.createBottomTabNavigator
  StatusBar = expo.StatusBar
  Ionicons = icons.Ionicons
}

import { onAuthStateChanged } from "firebase/auth"
import { auth } from "./config/firebase"
import { AuthProvider } from "./context/AuthContext"
import { ChatProvider } from "./context/ChatContext"

// Web fallback component
function WebFallback() {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div style={{ textAlign: "center" }}>
        <h1>Messenger Chat App</h1>
        <p>This app is designed for mobile devices.</p>
        <p>Please use Expo Go or a mobile simulator to view the full experience.</p>
      </div>
    </div>
  )
}

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

  // Return web fallback for web platform
  if (Platform.OS === "web") {
    return <WebFallback />
  }

  // Native app logic would go here
  // For now, return a simple loading state
  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        Loading...
      </div>
    )
  }

  return (
    <AuthProvider>
      <ChatProvider>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
            fontFamily: "Arial, sans-serif",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <h1>Messenger Chat App</h1>
            <p>Ready for mobile development!</p>
            <p>Use Expo CLI to run on mobile devices.</p>
          </div>
        </div>
      </ChatProvider>
    </AuthProvider>
  )
}
