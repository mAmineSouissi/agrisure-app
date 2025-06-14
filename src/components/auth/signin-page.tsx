"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Leaf, Shield, Cloud } from "lucide-react"
import { useAuth } from "./auth-provider"

interface SignInPageProps {
  onSwitchToSignUp: () => void
}

export function SignInPage({ onSwitchToSignUp }: SignInPageProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { signIn } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      await signIn(email, password)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de connexion")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo et titre */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-2">
            <div className="bg-green-600 p-3 rounded-full">
              <Leaf className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-green-800">AgriSure</h1>
          </div>
          <p className="text-gray-600">Votre assurance climatique intelligente</p>

          {/* Icônes des fonctionnalités */}
          <div className="flex justify-center space-x-6 pt-4">
            <div className="text-center">
              <Shield className="h-6 w-6 text-green-600 mx-auto mb-1" />
              <p className="text-xs text-gray-500">Protection</p>
            </div>
            <div className="text-center">
              <Cloud className="h-6 w-6 text-blue-600 mx-auto mb-1" />
              <p className="text-xs text-gray-500">Météo IA</p>
            </div>
            <div className="text-center">
              <Leaf className="h-6 w-6 text-green-600 mx-auto mb-1" />
              <p className="text-xs text-gray-500">Cultures</p>
            </div>
          </div>
        </div>

        {/* Formulaire de connexion */}
        <Card>
          <CardHeader>
            <CardTitle>Connexion</CardTitle>
            <CardDescription>Connectez-vous à votre compte AgriSure</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md">{error}</div>}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="votre@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={loading}>
                {loading ? "Connexion..." : "Se connecter"}
              </Button>
              <div className="text-center text-sm">
                <span className="text-gray-600">Pas encore de compte ? </span>
                <button
                  type="button"
                  onClick={onSwitchToSignUp}
                  className="text-green-600 hover:text-green-700 font-medium"
                >
                  S'inscrire
                </button>
              </div>
            </CardFooter>
          </form>
        </Card>

        {/* Footer */}
        <div className="text-center text-xs text-gray-500">
          <p>Propulsé par IA et Hedera</p>
          <p>En collaboration avec Irwise</p>
        </div>
      </div>
    </div>
  )
}
