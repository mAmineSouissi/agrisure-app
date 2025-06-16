"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Leaf, Shield, Cloud } from "lucide-react"
import { useAuth } from "./auth-provider"

interface SignUpPageProps {
  onSwitchToSignIn: () => void
}

export function SignUpPage({ onSwitchToSignIn }: SignUpPageProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { signUp } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      await signUp(email, password, name)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur d'inscription")
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
          <p className="text-gray-600">Rejoignez la révolution agricole</p>

          {/* Avantages */}
          <div className="grid grid-cols-2 gap-4 pt-4">
            <div className="text-center p-3 bg-white rounded-lg shadow-sm">
              <Shield className="h-5 w-5 text-green-600 mx-auto mb-1" />
              <p className="text-xs font-medium">Protection automatique</p>
            </div>
            <div className="text-center p-3 bg-white rounded-lg shadow-sm">
              <Cloud className="h-5 w-5 text-blue-600 mx-auto mb-1" />
              <p className="text-xs font-medium">Prédictions IA</p>
            </div>
          </div>
        </div>

        {/* Formulaire d'inscription */}
        <Card>
          <CardHeader>
            <CardTitle>Créer un compte</CardTitle>
            <CardDescription>Rejoignez des milliers d&apos;agriculteurs protégés</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md">{error}</div>}
              <div className="space-y-2">
                <Label htmlFor="name">Nom complet</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Votre nom"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
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
                {loading ? "Création du compte..." : "Créer mon compte"}
              </Button>
              <div className="text-center text-sm">
                <span className="text-gray-600">Déjà un compte ? </span>
                <button
                  type="button"
                  onClick={onSwitchToSignIn}
                  className="text-green-600 hover:text-green-700 font-medium"
                >
                  Se connecter
                </button>
              </div>
            </CardFooter>
          </form>
        </Card>

        {/* Stats */}
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-center space-x-4 text-sm">
            <div className="text-center">
              <div className="font-bold text-green-600">2,500+</div>
              <div className="text-gray-500">Agriculteurs</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-blue-600">95%</div>
              <div className="text-gray-500">Précision IA</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-green-600">$2M+</div>
              <div className="text-gray-500">Payés</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-gray-500">
          <p>Propulsé par IA et Hedera</p>
          <p>En collaboration avec Irwise</p>
        </div>
      </div>
    </div>
  )
}
