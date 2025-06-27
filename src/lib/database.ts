import { supabase, isSupabaseConfigured } from "./supabase";
import type {
  User,
  Farm,
  ClimateEvent,
  InsurancePayment,
  AIAgent,
  CropRecommendation,
  SensorData,
  RiskPrediction,
} from "./types";

// Fonction helper pour vérifier la configuration
const checkSupabaseConfig = () => {
  if (!isSupabaseConfigured()) {
    console.warn("Supabase not configured - using fallback data");
    throw new Error("Supabase configuration missing");
  }
};

export const database = {
  async getUser(id: string): Promise<User | null> {
    try {
      checkSupabaseConfig();
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data as User;
    } catch (error) {
      console.error("Database error:", error);
      return null;
    }
  },

  async getFarmsByUser(userId: string): Promise<Farm[]> {
    try {
      checkSupabaseConfig();
      const { data, error } = await supabase
        .from("farms")
        .select("*")
        .eq("user_id", userId);
      if (error) throw error;
      return data as Farm[];
    } catch (error) {
      console.error("Database error:", error);
      return [];
    }
  },

  async getClimateEvents(farmId: number): Promise<ClimateEvent[]> {
    try {
      checkSupabaseConfig();
      const { data, error } = await supabase
        .from("climate_events")
        .select("*")
        .eq("farm_id", farmId)
        .order("start_date", { ascending: false });
      if (error) throw error;
      return data as ClimateEvent[];
    } catch (error) {
      console.error("Database error:", error);
      return [];
    }
  },

  async getPaymentsByUser(userId: string): Promise<InsurancePayment[]> {
    try {
      checkSupabaseConfig();
      const { data, error } = await supabase
        .from("insurance_payments")
        .select(
          `
        *,
        climate_events (
          event_type,
          start_date,
          description
        )
      `
        )
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as InsurancePayment[];
    } catch (error) {
      console.error("Database error:", error);
      return [];
    }
  },

  async getCropRecommendations(farmId: number): Promise<CropRecommendation[]> {
    try {
      checkSupabaseConfig();
      const { data, error } = await supabase
        .from("crop_recommendations")
        .select("*")
        .eq("farm_id", farmId)
        .order("recommended_date", { ascending: false })
        .limit(5);
      if (error) throw error;
      return data as CropRecommendation[];
    } catch (error) {
      console.error("Database error:", error);
      return [];
    }
  },

  async getLatestSensorData(farmId: number): Promise<SensorData[]> {
    try {
      checkSupabaseConfig();
      const { data, error } = await supabase
        .from("sensor_data")
        .select("*")
        .eq("farm_id", farmId)
        .order("recorded_at", { ascending: false })
        .limit(10);
      if (error) throw error;
      return data as SensorData[];
    } catch (error) {
      console.error("Database error:", error);
      return [];
    }
  },

  async getRiskPredictions(farmId: number): Promise<RiskPrediction[]> {
    try {
      checkSupabaseConfig();
      const { data, error } = await supabase
        .from("risk_predictions")
        .select("*")
        .eq("farm_id", farmId)
        .gte("valid_until", new Date().toISOString())
        .order("probability", { ascending: false });
      if (error) throw error;
      return data as RiskPrediction[];
    } catch (error) {
      console.error("Database error:", error);
      return [];
    }
  },

  async getAIAgents(): Promise<AIAgent[]> {
    try {
      checkSupabaseConfig();
      const { data, error } = await supabase
        .from("ai_agents")
        .select("*")
        .order("name");
      if (error) throw error;
      return data as AIAgent[];
    } catch (error) {
      console.error("Database error:", error);
      return [];
    }
  },

  async updateAIAgent(
    id: number,
    updates: Partial<AIAgent>
  ): Promise<AIAgent | null> {
    try {
      checkSupabaseConfig();
      const { data, error } = await supabase
        .from("ai_agents")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data as AIAgent;
    } catch (error) {
      console.error("Database error:", error);
      return null;
    }
  },
};
