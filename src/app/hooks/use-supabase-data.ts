"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/auth/auth-provider";

interface Farm {
  id: number;
  [key: string]: unknown;
}

interface Payment {
  id: number;
  [key: string]: unknown;
}

interface Agent {
  id: number;
  [key: string]: unknown;
}

interface ClimateEvent {
  id: number;
  [key: string]: unknown;
}

interface Recommendation {
  id: number;
  [key: string]: unknown;
}

interface RiskPrediction {
  id: number;
  [key: string]: unknown;
}

interface DashboardData {
  farms: Farm[];
  payments: Payment[];
  agents: Agent[];
  climateEvents: ClimateEvent[];
  recommendations: Recommendation[];
  riskPredictions: RiskPrediction[];
}

interface DashboardDataResult {
  data: DashboardData | null;
  loading: boolean;
  error: string | null;
}

// Hook pour récupérer les données du dashboard
export function useDashboardData(): DashboardDataResult {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchData = async (): Promise<void> => {
      try {
        setLoading(true);

        // Récupérer les fermes de l'utilisateur
        const { data: farms, error: farmsError } = await supabase
          .from("farms")
          .select("*")
          .eq("user_id", user.id);

        if (farmsError) throw farmsError;

        // Récupérer les paiements
        const { data: payments, error: paymentsError } = await supabase
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
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (paymentsError) throw paymentsError;

        // Récupérer les agents IA
        const { data: agents, error: agentsError } = await supabase
          .from("ai_agents")
          .select("*")
          .order("name");

        if (agentsError) throw agentsError;

        // Si l'utilisateur a des fermes, récupérer les données spécifiques
        let climateEvents: ClimateEvent[] = [];
        let recommendations: Recommendation[] = [];
        let riskPredictions: RiskPrediction[] = [];

        if (farms && farms.length > 0) {
          const farmId = farms[0].id;

          // Événements climatiques
          const { data: events } = await supabase
            .from("climate_events")
            .select("*")
            .eq("farm_id", farmId)
            .order("start_date", { ascending: false })
            .limit(10);

          // Recommandations de cultures
          const { data: recs } = await supabase
            .from("crop_recommendations")
            .select("*")
            .eq("farm_id", farmId)
            .order("recommended_date", { ascending: false })
            .limit(5);

          // Prédictions de risques
          const { data: risks } = await supabase
            .from("risk_predictions")
            .select("*")
            .eq("farm_id", farmId)
            .gte("valid_until", new Date().toISOString())
            .order("probability", { ascending: false });

          climateEvents = events || [];
          recommendations = recs || [];
          riskPredictions = risks || [];
        }

        setData({
          farms: farms || [],
          payments: payments || [],
          agents: agents || [],
          climateEvents,
          recommendations,
          riskPredictions,
        });
      } catch (err) {
        console.error("Erreur lors du chargement des données:", err);
        setError(err instanceof Error ? err.message : "Erreur de chargement");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  return { data, loading, error };
}

// Hook pour les agents IA
interface AIAgentsResult {
  agents: Agent[];
  loading: boolean;
  updateAgent: (id: number, updates: Partial<Agent>) => Promise<void>;
}

export function useAIAgents(): AIAgentsResult {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchAgents = async (): Promise<void> => {
      try {
        const { data, error } = await supabase
          .from("ai_agents")
          .select("*")
          .order("name");

        if (error) throw error;
        setAgents(data || []);
      } catch (error) {
        console.error("Erreur lors du chargement des agents:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAgents();
  }, []);

  const updateAgent = async (
    id: number,
    updates: Partial<Agent>
  ): Promise<void> => {
    try {
      const { data, error } = await supabase
        .from("ai_agents")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      setAgents((prev) =>
        prev.map((agent) => (agent.id === id ? data : agent))
      );
    } catch (error) {
      console.error("Erreur lors de la mise à jour de l'agent:", error);
    }
  };

  return { agents, loading, updateAgent };
}
