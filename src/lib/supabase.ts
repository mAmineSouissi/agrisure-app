import { createClient } from "@supabase/supabase-js"

// Vérifier que les variables d'environnement sont définies
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl) {
  throw new Error("Missing env.NEXT_PUBLIC_SUPABASE_URL")
}

if (!supabaseAnonKey) {
  throw new Error("Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY")
}

// Client pour le côté client
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Client pour le serveur (avec service role key)
export const supabaseAdmin = supabaseServiceRoleKey ? createClient(supabaseUrl, supabaseServiceRoleKey) : null

// Types TypeScript
export interface Profile {
  id: string
  email: string
  name: string
  avatar_url?: string
  created_at: string
  updated_at: string
}

export interface Farm {
  id: number
  user_id: string
  name: string
  location: string
  size_hectares: number
  soil_type: string
  created_at: string
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
  created_at: string
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
  created_at: string
}

export interface AIAgent {
  id: number
  name: string
  type: string
  status: string
  last_run?: string
  accuracy_rate: number
  total_predictions: number
  config?: any
  n8n_workflow_id?: string
  created_at: string
  updated_at: string
}
