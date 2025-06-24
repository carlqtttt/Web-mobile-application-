"use client"

import { signOut } from "firebase/auth"
import { LogOut, Bell, Lock, HelpCircle, Camera, ChevronRight } from "lucide-react"
import { auth } from "../config/firebase"
import { useAuth } from "../context/AuthContext"

interface SettingsScreenProps {
  onNavigate: (screen: string) => void
}

export function SettingsScreen({ onNavigate }: SettingsScreenProps) {
  const { user, userProfile } = useAuth()

  const handleSignOut = async () => {
    if (confirm("Are you sure you want to sign out?")) {
      await signOut(auth)
    }
  }

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen">
      <div className="p-4 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
      </div>

      {/* Profile Section */}
      <div className="p-6 text-center border-b border-gray-200">
        <div className="relative inline-block">
          <div className="w-24 h-24 bg-gray-300 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl text-gray-600 font-medium">{userProfile?.displayName?.charAt(0) || "?"}</span>
          </div>
          <button className="absolute bottom-3 right-0 bg-blue-600 text-white p-2 rounded-full">
            <Camera size={16} />
          </button>
        </div>
        <h2 className="text-xl font-semibold text-gray-900">{userProfile?.displayName}</h2>
        <p className="text-gray-600">{user?.email}</p>
      </div>

      {/* Settings Options */}
      <div className="divide-y divide-gray-200">
        <div className="p-4 hover:bg-gray-50 cursor-pointer">
          <div className="flex items-center space-x-3">
            <Bell size={24} className="text-blue-600" />
            <span className="flex-1 text-gray-900">Notifications</span>
            <ChevronRight size={20} className="text-gray-400" />
          </div>
        </div>

        <div className="p-4 hover:bg-gray-50 cursor-pointer">
          <div className="flex items-center space-x-3">
            <Lock size={24} className="text-blue-600" />
            <span className="flex-1 text-gray-900">Privacy</span>
            <ChevronRight size={20} className="text-gray-400" />
          </div>
        </div>

        <div className="p-4 hover:bg-gray-50 cursor-pointer">
          <div className="flex items-center space-x-3">
            <HelpCircle size={24} className="text-blue-600" />
            <span className="flex-1 text-gray-900">Help & Support</span>
            <ChevronRight size={20} className="text-gray-400" />
          </div>
        </div>
      </div>

      {/* Sign Out Button */}
      <div className="p-4 mt-8">
        <button
          onClick={handleSignOut}
          className="w-full flex items-center justify-center space-x-2 py-3 px-4 border border-red-300 rounded-lg text-red-600 hover:bg-red-50"
        >
          <LogOut size={20} />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  )
}
