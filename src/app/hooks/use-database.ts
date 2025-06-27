"use client";

import { useState, useEffect } from "react";
import { database } from "@/lib/database";
import type {
  ClimateEvent,
  AIAgent,
  CropRecommendation,
  SensorData,
  RiskPrediction,
  DashboardData,
} from "@/lib/types";
import { useAuth } from "@/components/auth/auth-provider";

interface DashboardDataResult {
  data: DashboardData | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

// Hook pour récupérer les données du dashboard
export function useDashboardData(): DashboardDataResult {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async (): Promise<void> => {
    try {
      setLoading(true);

      if (!user) {
        throw new Error("Utilisateur non connecté");
      }
      const [farms, payments, agents] = await Promise.all([
        database.getFarmsByUser(user.id),
        database.getPaymentsByUser(user.id),
        database.getAIAgents(),
      ]);

      let climateEvents: ClimateEvent[] = [];
      let recommendations: CropRecommendation[] = [];
      let sensorData: SensorData[] = [];
      let riskPredictions: RiskPrediction[] = [];

      if (farms.length > 0) {
        const farmId = farms[0].id;

        const [events, recs, sensors, risks] = await Promise.all([
          database.getClimateEvents(farmId),
          database.getCropRecommendations(farmId),
          database.getLatestSensorData(farmId),
          database.getRiskPredictions(farmId),
        ]);

        climateEvents = events;
        recommendations = recs;
        sensorData = sensors;
        riskPredictions = risks;
      }

      setData({
        farms,
        payments,
        agents,
        climateEvents,
        recommendations,
        sensorData,
        riskPredictions,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de chargement");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  return { data, loading, error, refetch: fetchData };
}

// Hook pour les agents IA
interface AIAgentsResult {
  agents: AIAgent[];
  loading: boolean;
  updateAgent: (id: number, updates: Partial<AIAgent>) => Promise<void>;
}

export function useAIAgents(): AIAgentsResult {
  const [agents, setAgents] = useState<AIAgent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchAgents = async (): Promise<void> => {
      try {
        const data = await database.getAIAgents();
        setAgents(data);
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
    updates: Partial<AIAgent>
  ): Promise<void> => {
    try {
      const updatedAgent = await database.updateAIAgent(id, updates);
      if (updatedAgent) {
        setAgents((prev) =>
          prev.map((agent) => (agent.id === id ? updatedAgent : agent))
        );
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour de l'agent:", error);
    }
  };

  return { agents, loading, updateAgent };
}
