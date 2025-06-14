"use client"

import { useState } from "react"
import { SignInPage } from "@/components/auth/signin-page"
import { SignUpPage } from "@/components/auth/signup-page"
import { MainLayout } from "@/components/layout/main-layout"
import { useAuth } from "@/components/auth/auth-provider"

export default function App() {
  const { user, loading } = useAuth()
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin")

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-green-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-green-700 font-medium">Chargement d'AgriSure...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return authMode === "signin" ? (
      <SignInPage onSwitchToSignUp={() => setAuthMode("signup")} />
    ) : (
      <SignUpPage onSwitchToSignIn={() => setAuthMode("signin")} />
    )
  }

  return <MainLayout />
}
