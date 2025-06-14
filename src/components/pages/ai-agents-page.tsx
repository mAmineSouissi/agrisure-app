"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Bot, Cloud, Leaf, BarChart3, Settings, Play, Pause, Activity, Zap, Brain, Database } from "lucide-react"

export function AIAgentsPage() {
  const [agents, setAgents] = useState([
    {
      id: 1,
      name: "Agent Météo",
      description: "Analyse les données météorologiques et prédit les risques climatiques",
      status: "active",
      icon: Cloud,
      color: "text-blue-600",
      bg: "bg-blue-50",
      lastRun: "Il y a 5 minutes",
      accuracy: "94%",
      predictions: 1247,
      enabled: true,
    },
    {
      id: 2,
      name: "Agent Cultures",
      description: "Recommande les meilleures cultures selon les conditions",
      status: "active",
      icon: Leaf,
      color: "text-green-600",
      bg: "bg-green-50",
      lastRun: "Il y a 12 minutes",
      accuracy: "89%",
      predictions: 856,
      enabled: true,
    },
    {
      id: 3,
      name: "Agent Risques",
      description: "Calcule les probabilités de catastrophes climatiques",
      status: "active",
      icon: BarChart3,
      color: "text-orange-600",
      bg: "bg-orange-50",
      lastRun: "Il y a 2 minutes",
      accuracy: "92%",
      predictions: 2103,
      enabled: true,
    },
    {
      id: 4,
      name: "Agent Paiements",
      description: "Gère les paiements automatiques via blockchain Hedera",
      status: "standby",
      icon: Zap,
      color: "text-purple-600",
      bg: "bg-purple-50",
      lastRun: "Il y a 1 heure",
      accuracy: "99%",
      predictions: 45,
      enabled: false,
    },
  ])

  const toggleAgent = (id: number) => {
    setAgents(
      agents.map((agent) =>
        agent.id === id
          ? {
              ...agent,
              enabled: !agent.enabled,
              status: !agent.enabled ? "active" : "standby",
            }
          : agent,
      ),
    )
  }

  const totalPredictions = agents.reduce((sum, agent) => sum + agent.predictions, 0)
  const activeAgents = agents.filter((agent) => agent.enabled).length

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-green-800">Agents IA</h1>
        <p className="text-muted-foreground">Gérez vos agents d'intelligence artificielle pour l'analyse agricole</p>
      </div>

      {/* Statistiques globales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Agents actifs</p>
                <p className="text-2xl font-bold text-blue-600">{activeAgents}/4</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Prédictions totales</p>
                <p className="text-2xl font-bold text-green-600">{totalPredictions.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm text-muted-foreground">Précision moyenne</p>
                <p className="text-2xl font-bold text-orange-600">
                  {Math.round(agents.reduce((sum, agent) => sum + Number.parseInt(agent.accuracy), 0) / agents.length)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-muted-foreground">Intégration n8n</p>
                <p className="text-2xl font-bold text-purple-600">Prêt</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Liste des agents */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {agents.map((agent) => (
          <Card key={agent.id} className="relative">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-lg ${agent.bg}`}>
                    <agent.icon className={`h-6 w-6 ${agent.color}`} />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{agent.name}</CardTitle>
                    <CardDescription className="mt-1">{agent.description}</CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={agent.status === "active" ? "default" : "secondary"}
                    className={agent.status === "active" ? "bg-green-100 text-green-800" : ""}
                  >
                    {agent.status === "active" ? "Actif" : "En attente"}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Métriques */}
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-green-600">{agent.accuracy}</p>
                  <p className="text-xs text-muted-foreground">Précision</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-600">{agent.predictions}</p>
                  <p className="text-xs text-muted-foreground">Prédictions</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{agent.lastRun}</p>
                  <p className="text-xs text-muted-foreground">Dernière exécution</p>
                </div>
              </div>

              {/* Contrôles */}
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center gap-2">
                  <Switch checked={agent.enabled} onCheckedChange={() => toggleAgent(agent.id)} />
                  <span className="text-sm font-medium">{agent.enabled ? "Activé" : "Désactivé"}</span>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4 mr-1" />
                    Config
                  </Button>
                  <Button variant="outline" size="sm" disabled={!agent.enabled}>
                    {agent.status === "active" ? (
                      <>
                        <Pause className="h-4 w-4 mr-1" />
                        Pause
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-1" />
                        Démarrer
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Intégration n8n */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-purple-600" />
            Intégration n8n
          </CardTitle>
          <CardDescription>Configuration de l'intégration avec n8n pour l'orchestration des agents IA</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-semibold text-green-800 mb-2">Statut de connexion</h4>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-green-700">Connecté à n8n</span>
              </div>
              <p className="text-xs text-green-600 mt-1">Dernière synchronisation : Il y a 2 minutes</p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">Workflows actifs</h4>
              <p className="text-2xl font-bold text-blue-600">3</p>
              <p className="text-xs text-blue-600 mt-1">Météo, Cultures, Risques</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Configurer n8n
            </Button>
            <Button variant="outline">
              <Activity className="h-4 w-4 mr-2" />
              Voir les logs
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
