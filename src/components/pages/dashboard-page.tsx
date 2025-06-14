"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Shield,
  CheckCircle,
  AlertTriangle,
  Droplets,
  Sun,
  Thermometer,
  TrendingUp,
  Calendar,
  DollarSign,
  Code,
  Zap,
  Brain,
} from "lucide-react"
import { useDashboardData } from "@/app/hooks/use-supabase-data" // or the correct path

interface RiskDataItem {
  risk: string
  probability: string
  impact: string
  color: string
}

interface DashboardPageProps {
  onNavigate: (page: string) => void
}

export function DashboardPage({ onNavigate }: DashboardPageProps) {
  const { data, loading, error } = useDashboardData()

  // Example fallback if data is not loaded yet
  const coverage = data?.coverage || 0
  const protectedDays = data?.protectedDays || 0
  const paymentsReceived = data?.payments?.length || 0
  const smartContracts = data?.contracts?.length || 0

  // Example: riskData from backend or AI
  const riskData = data?.riskData || [
    { risk: "Sécheresse", probability: "70%", impact: "Élevé", color: "destructive" },
    { risk: "Inondation", probability: "20%", impact: "Modéré", color: "secondary" },
    { risk: "Grêle", probability: "15%", impact: "Faible", color: "outline" },
  ]

  const notifications = [
    {
      id: 1,
      type: "payment",
      message: "Paiement reçu : 50 $ (Sécheresse, 13/06/2025)",
      icon: CheckCircle,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      id: 2,
      type: "alert",
      message: "Alerte météo : Risque de sécheresse dans 3 jours",
      icon: AlertTriangle,
      color: "text-orange-600",
      bg: "bg-orange-50",
    },
    {
      id: 3,
      type: "contract",
      message: "Nouveau smart contract déployé avec succès",
      icon: Code,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
    {
      id: 4,
      type: "recommendation",
      message: "Nouvelle recommandation de culture disponible",
      icon: TrendingUp,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
  ]

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-green-800">Tableau de bord AgriSure</h1>
        <p className="text-muted-foreground">
          Votre assurance climatique intelligente - Dernière mise à jour : {new Date().toLocaleDateString("fr-FR")}
        </p>
      </div>

      {/* Statut actuel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-green-600" />
            Statut de protection
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-lg font-semibold text-green-800">Aucune catastrophe détectée</p>
                <p className="text-sm text-green-600">Vos cultures sont actuellement protégées</p>
              </div>
            </div>
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              Actif
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Métriques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Couverture totale</p>
                <p className="text-2xl font-bold text-green-600">
                  {loading ? "..." : `${coverage.toLocaleString()} $`}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Jours protégés</p>
                <p className="text-2xl font-bold text-blue-600">
                  {loading ? "..." : protectedDays}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Paiements reçus</p>
                <p className="text-2xl font-bold text-green-600">
                  {loading ? "..." : paymentsReceived}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Code className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-muted-foreground">Smart Contracts</p>
                <p className="text-2xl font-bold text-purple-600">
                  {loading ? "..." : smartContracts}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions rapides */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => onNavigate("smart-contracts")}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-purple-100 p-3 rounded-lg">
                <Code className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold">Générer un contrat</h3>
                <p className="text-sm text-muted-foreground">Créer un nouveau smart contract avec l'IA</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => onNavigate("ai-agents")}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-3 rounded-lg">
                <Brain className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold">Agents IA</h3>
                <p className="text-sm text-muted-foreground">Gérer vos agents intelligents</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => onNavigate("chatbot")}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-3 rounded-lg">
                <Zap className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibent">Assistant IA</h3>
                <p className="text-sm text-muted-foreground">Poser une question à l'assistant</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notifications */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Notifications récentes</CardTitle>
            <CardDescription>Dernières activités sur votre compte</CardDescription>
          </div>
          <Button variant="outline" onClick={() => onNavigate("history")}>
            Voir l'historique
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {notifications.map((notification) => (
            <div key={notification.id} className={`flex items-center gap-3 p-3 rounded-lg ${notification.bg}`}>
              <notification.icon className={`h-5 w-5 ${notification.color}`} />
              <p className="text-sm flex-1">{notification.message}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Recommandations IA */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sun className="h-5 w-5 text-orange-500" />
            Recommandation pour la saison
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-blue-50 rounded-lg space-y-3">
            <div className="flex items-start gap-3">
              <div className="bg-blue-600 p-2 rounded-full">
                <Sun className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-blue-800">Plantez du sorgho (résistant à la sécheresse)</h3>
                <p className="text-sm text-blue-700 mt-1">
                  Adapté à faible humidité et températures élevées (32°C). Rendement optimal dans les conditions
                  actuelles.
                </p>
                <div className="flex gap-2 mt-2">
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    <Droplets className="h-3 w-3 mr-1" />
                    Faible eau
                  </Badge>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    <Thermometer className="h-3 w-3 mr-1" />
                    Haute température
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tableau de probabilité des risques */}
      <Card>
        <CardHeader>
          <CardTitle>Analyse des risques climatiques</CardTitle>
          <CardDescription>Probabilités basées sur les données météo et capteurs Irwise</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-semibold">Risque</th>
                  <th className="text-center p-3 font-semibold">Probabilité</th>
                  <th className="text-center p-3 font-semibold">Impact</th>
                  <th className="text-center p-3 font-semibold">Statut</th>
                </tr>
              </thead>
              <tbody>
                {riskData.map((item: RiskDataItem, index: number) => (
                  <tr key={index} className={index % 2 === 0 ? "bg-muted/50" : ""}>
                  <td className="p-3 font-medium">{item.risk}</td>
                  <td className="p-3 text-center font-semibold">{item.probability}</td>
                  <td className="p-3 text-center">{item.impact}</td>
                  <td className="p-3 text-center">
                    <Badge variant={item.color as any}>{item.impact}</Badge>
                  </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
