import { supabase } from "./supabase";
import type {
  User,
  Farm,
  ClimateEvent,
  InsurancePayment,
  AIAgent,
  CropRecommendation,
  SensorData,
  RiskPrediction
} from "./types";

export const database = {
  async getUser(id: string): Promise<User | null> {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", id)
      .single();
    if (error) throw error;
    return data as User;
  },

  async getFarmsByUser(userId: string): Promise<Farm[]> {
    const { data, error } = await supabase
      .from("farms")
      .select("*")
      .eq("user_id", userId);
    if (error) throw error;
    return data as Farm[];
  },

  async getClimateEvents(farmId: number): Promise<ClimateEvent[]> {
    const { data, error } = await supabase
      .from("climate_events")
      .select("*")
      .eq("farm_id", farmId)
      .order("start_date", { ascending: false });
    if (error) throw error;
    return data as ClimateEvent[];
  },

  async getPaymentsByUser(userId: string): Promise<InsurancePayment[]> {
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
  },

  async getCropRecommendations(farmId: number): Promise<CropRecommendation[]> {
    const { data, error } = await supabase
      .from("crop_recommendations")
      .select("*")
      .eq("farm_id", farmId)
      .order("recommended_date", { ascending: false })
      .limit(5);
    if (error) throw error;
    return data as CropRecommendation[];
  },

  async getLatestSensorData(farmId: number): Promise<SensorData[]> {
    const { data, error } = await supabase
      .from("sensor_data")
      .select("*")
      .eq("farm_id", farmId)
      .order("recorded_at", { ascending: false })
      .limit(10);
    if (error) throw error;
    return data as SensorData[];
  },

  async getRiskPredictions(farmId: number): Promise<RiskPrediction[]> {
    const { data, error } = await supabase
      .from("risk_predictions")
      .select("*")
      .eq("farm_id", farmId)
      .gte("valid_until", new Date().toISOString())
      .order("probability", { ascending: false });
    if (error) throw error;
    return data as RiskPrediction[];
  },

  async getAIAgents(): Promise<AIAgent[]> {
    const { data, error } = await supabase
      .from("ai_agents")
      .select("*")
      .order("name");
    if (error) throw error;
    return data as AIAgent[];
  },

  async updateAIAgent(
    id: number,
    updates: Partial<AIAgent>
  ): Promise<AIAgent | null> {
    const { data, error } = await supabase
      .from("ai_agents")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data as AIAgent;
  },
};
