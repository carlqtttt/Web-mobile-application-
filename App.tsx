"use client"

import { useEffect, useState } from "react"
import { NavigationContainer } from "@react-navigation/native"
import { createStackNavigator } from "@react-navigation/stack"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { StatusBar } from "expo-status-bar"
import { Ionicons } from "@expo/vector-icons"
import { onAuthStateChanged } from "firebase/auth"
import { auth } from "./config/firebase"
import { AuthProvider } from "./context/AuthContext"
import { ChatProvider } from "./context/ChatContext"
import LoginScreen from "./screens/LoginScreen"
import SignupScreen from "./screens/SignupScreen"
import ChatListScreen from "./screens/ChatListScreen"
import UsersScreen from "./screens/UsersScreen"
import SettingsScreen from "./screens/SettingsScreen"
import ChatScreen from "./screens/ChatScreen"
import LoadingScreen from "./screens/LoadingScreen"

const Stack = createStackNavigator()
const Tab = createBottomTabNavigator()

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName
          if (route.name === "Chats") {
            iconName = focused ? "chatbubbles" : "chatbubbles-outline"
          } else if (route.name === "Users") {
            iconName = focused ? "people" : "people-outline"
          } else if (route.name === "Settings") {
            iconName = focused ? "settings" : "settings-outline"
          }
          return <Ionicons name={iconName} size={size} color={color} />
        },
        tabBarActiveTintColor: "#007AFF",
        tabBarInactiveTintColor: "gray",
        headerShown: false,
      })}
    >
      <Tab.Screen name="Chats" component={ChatListScreen} />
      <Tab.Screen name="Users" component={UsersScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
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

  if (loading) {
    return <LoadingScreen />
  }

  return (
    <AuthProvider>
      <ChatProvider>
        <NavigationContainer>
          <StatusBar style="auto" />
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            {user ? (
              <>
                <Stack.Screen name="MainTabs" component={MainTabs} />
                <Stack.Screen
                  name="Chat"
                  component={ChatScreen}
                  options={{ headerShown: true, headerBackTitleVisible: false }}
                />
              </>
            ) : (
              <>
                <Stack.Screen name="Login" component={LoginScreen} />
                <Stack.Screen name="Signup" component={SignupScreen} />
              </>
            )}
          </Stack.Navigator>
        </NavigationContainer>
      </ChatProvider>
    </AuthProvider>
  )
}
