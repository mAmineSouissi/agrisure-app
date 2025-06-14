"use client"

import { useState, useEffect } from "react"
import { database } from "@/lib/database"
import { useAuth } from "@/components/auth/auth-provider"

// Hook pour récupérer les données du dashboard
export function useDashboardData() {
  const { user } = useAuth()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    try {
      setLoading(true)

      // Récupérer les données en parallèle
      if (!user) {
        throw new Error("Utilisateur non connecté")
      }
      const [farms, payments, agents] = await Promise.all([
        database.getFarmsByUser(user.id),
        database.getPaymentsByUser(user.id),
        database.getAIAgents(),
      ])

      // Si l'utilisateur a des fermes, récupérer les données spécifiques
      let climateEvents = [] as any[]
      let recommendations = []
      let sensorData = []
      let riskPredictions = []

      if (farms.length > 0) {
        const farmId = farms[0].id // Utiliser la première ferme

        const [events, recs, sensors, risks] = await Promise.all([
          database.getClimateEvents(farmId),
          database.getCropRecommendations(farmId),
          database.getLatestSensorData(farmId),
          database.getRiskPredictions(farmId),
        ])

        climateEvents = events
        recommendations = recs
        sensorData = sensors
        riskPredictions = risks
      }

      setData({
        farms,
        payments,
        agents,
        climateEvents,
        recommendations,
        sensorData,
        riskPredictions,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de chargement")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!user) return

    fetchData()
  }, [user])

  return { data, loading, error, refetch: () => fetchData() }
}

// Hook pour les agents IA
export function useAIAgents() {
  const [agents, setAgents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const data = await database.getAIAgents()
        setAgents(data)
      } catch (error) {
        console.error("Erreur lors du chargement des agents:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchAgents()
  }, [])

  const updateAgent = async (id: number, updates: any) => {
    try {
      const updatedAgent = await database.updateAIAgent(id, updates)
      setAgents(agents.map((agent) => (agent.id === id ? updatedAgent : agent)))
    } catch (error) {
      console.error("Erreur lors de la mise à jour de l'agent:", error)
    }
  }

  return { agents, loading, updateAgent }
}
