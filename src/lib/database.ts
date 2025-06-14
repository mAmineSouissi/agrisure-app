import { supabase } from "./supabase"

// Types TypeScript pour vos données
export interface User {
  id: string
  email: string
  name: string
  avatar_url?: string
  created_at: string
}

export interface Farm {
  id: number
  user_id: string
  name: string
  location: string
  size_hectares: number
  soil_type: string
  created_at: string // Add this line
}

export interface ClimateEvent {
  id: number
  farm_id: number
  event_type: string
  severity: string
  start_date: string
  end_date?: string
  description: string
  verified: boolean
  created_at: string // Add this line
}

export interface InsurancePayment {
  id: number
  user_id: string
  climate_event_id: number
  amount: number
  currency: string
  status: string
  hedera_transaction_id?: string
  paid_at?: string
  created_at: string // Add this line
}

// Fonctions pour interagir avec la base de données
export const database = {
  // Utilisateurs
  async getUser(id: string) {
    const { data, error } = await supabase.from("users").select("*").eq("id", id).single()

    if (error) throw error
    return data as User
  },

  // Exploitations agricoles
  async getFarmsByUser(userId: string) {
    const { data, error } = await supabase.from("farms").select("*").eq("user_id", userId)

    if (error) throw error
    return data as Farm[]
  },

  // Événements climatiques
  async getClimateEvents(farmId: number) {
    const { data, error } = await supabase
      .from("climate_events")
      .select("*")
      .eq("farm_id", farmId)
      .order("start_date", { ascending: false })

    if (error) throw error
    return data as ClimateEvent[]
  },

  // Paiements d'assurance
  async getPaymentsByUser(userId: string) {
    const { data, error } = await supabase
      .from("insurance_payments")
      .select(`
        *,
        climate_events (
          event_type,
          start_date,
          description
        )
      `)
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (error) throw error
    return data as InsurancePayment[]
  },

  // Recommandations de cultures
  async getCropRecommendations(farmId: number) {
    const { data, error } = await supabase
      .from("crop_recommendations")
      .select("*")
      .eq("farm_id", farmId)
      .order("recommended_date", { ascending: false })
      .limit(5)

    if (error) throw error
    return data
  },

  // Données des capteurs
  async getLatestSensorData(farmId: number) {
    const { data, error } = await supabase
      .from("sensor_data")
      .select("*")
      .eq("farm_id", farmId)
      .order("recorded_at", { ascending: false })
      .limit(10)

    if (error) throw error
    return data
  },

  // Prédictions de risques
  async getRiskPredictions(farmId: number) {
    const { data, error } = await supabase
      .from("risk_predictions")
      .select("*")
      .eq("farm_id", farmId)
      .gte("valid_until", new Date().toISOString())
      .order("probability", { ascending: false })

    if (error) throw error
    return data
  },

  // Agents IA
  async getAIAgents() {
    const { data, error } = await supabase.from("ai_agents").select("*").order("name")

    if (error) throw error
    return data
  },

  async updateAIAgent(id: number, updates: Partial<any>) {
    const { data, error } = await supabase.from("ai_agents").update(updates).eq("id", id).select().single()

    if (error) throw error
    return data
  },
}
