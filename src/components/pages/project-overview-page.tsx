"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import {
  TimerIcon as Timeline,
  Database,
  Code,
  Zap,
  CheckCircle,
  Clock,
  AlertTriangle,
  Rocket,
  Settings,
  Activity,
  BarChart3,
  Server,
  Workflow,
  Shield,
} from "lucide-react";
import { database } from "@/lib/database";
import { useAuth } from "@/components/auth/auth-provider";
import { supabase } from "@/lib/supabase";

interface ProjectEvent {
  id: string;
  timestamp: string;
  type: "database" | "contract" | "workflow" | "integration" | "deployment";
  title: string;
  description: string;
  status: "completed" | "in-progress" | "failed";
  details?: Record<string, unknown>;
}

interface ProjectMetrics {
  totalContracts: number;
  totalWorkflows: number;
  databaseTables: number;
  integrations: number;
  deployments: number;
  successRate: number;
  realTimeData: {
    users: number;
    farms: number;
    climateEvents: number;
    payments: number;
    agents: number;
    sensorReadings: number;
  };
}

interface SystemStatus {
  database: "connected" | "disconnected" | "error";
  hedera: "connected" | "disconnected" | "error";
  n8n: "connected" | "disconnected" | "error";
  api: "operational" | "degraded" | "down";
}

export function ProjectOverviewPage(): React.JSX.Element {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("timeline");
  const [projectEvents, setProjectEvents] = useState<ProjectEvent[]>([]);
  const [metrics, setMetrics] = useState<ProjectMetrics | null>(null);
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    loadRealProjectData();
    const interval = setInterval(loadRealProjectData, 30000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const loadRealProjectData = async (): Promise<void> => {
    try {
      setLoading(true);
      const status = await checkSystemStatus();
      setSystemStatus(status);
      const realData = await getRealDatabaseMetrics();
      const events = await generateRealEvents(realData);
      const realMetrics = await calculateRealMetrics(realData, status);
      setProjectEvents(events);
      setMetrics(realMetrics);
      setLastUpdate(new Date());
    } catch (error) {
      console.error("Erreur lors du chargement des données:", error);
      loadFallbackData();
    } finally {
      setLoading(false);
    }
  };

  const checkSystemStatus = async (): Promise<SystemStatus> => {
    const status: SystemStatus = {
      database: "disconnected",
      hedera: "disconnected",
      n8n: "disconnected",
      api: "operational",
    };

    try {
      await database.getAIAgents();
      status.database = "connected";
    } catch {
      status.database = "error";
    }

    try {
      const response = await fetch("/api/hedera/status");
      status.hedera = response.ok ? "connected" : "error";
    } catch {
      status.hedera = "error";
    }

    try {
      const response = await fetch("/api/n8n/status");
      status.n8n = response.ok ? "connected" : "disconnected";
    } catch {
      status.n8n = "disconnected";
    }

    return status;
  };

  const getRealDatabaseMetrics = async (): Promise<
    ProjectMetrics["realTimeData"] | null
  > => {
    if (!user) return null;

    try {
      const [farms, payments, agents, climateEvents] = await Promise.all([
        database.getFarmsByUser(user.id),
        database.getPaymentsByUser(user.id),
        database.getAIAgents(),
        database.getFarmsByUser(user.id).then(async (farms) => {
          if (farms.length === 0) return [];
          const events = await database.getClimateEvents(farms[0].id);
          return events;
        }),
      ]);

      let sensorReadings = 0;
      if (farms.length > 0) {
        const sensors = await database.getLatestSensorData(farms[0].id);
        sensorReadings = sensors?.length || 0;
      }

      return {
        users: 1,
        farms: farms.length,
        climateEvents: Array.isArray(climateEvents) ? climateEvents.length : 0,
        payments: payments.length,
        agents: agents.length,
        sensorReadings,
      };
    } catch (error) {
      console.error("Erreur récupération données:", error);
      return null;
    }
  };

  const getRecentContractEvents = async (): Promise<ProjectEvent[]> => {
    try {
      const { data: contracts, error } = await supabase
        .from("smart_contracts")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5);

      if (error) throw error;

      return (
        contracts?.map((contract) => ({
          id: `contract-${contract.id}`,
          timestamp: contract.created_at,
          type: "contract" as const,
          title: `Smart Contract ${contract.contract_type}`,
          description: `Contrat déployé sur ${contract.blockchain_network}`,
          status:
            contract.status === "deployed"
              ? ("completed" as const)
              : ("in-progress" as const),
          details: {
            contractId: contract.contract_address || contract.id,
            network: contract.blockchain_network,
            coverage: contract.coverage_amount,
            type: contract.contract_type,
          },
        })) || []
      );
    } catch (error) {
      console.error("Erreur récupération contrats:", error);
      return [];
    }
  };

  const getRecentWorkflowEvents = async (): Promise<ProjectEvent[]> => {
    try {
      const { data: workflows, error } = await supabase
        .from("n8n_workflow_executions")
        .select("*")
        .order("executed_at", { ascending: false })
        .limit(5);

      if (error) throw error;

      return (
        workflows?.map((workflow) => ({
          id: `workflow-${workflow.id}`,
          timestamp: workflow.executed_at,
          type: "workflow" as const,
          title: `Workflow ${workflow.workflow_name}`,
          description: workflow.description || "Workflow automatique exécuté",
          status:
            workflow.status === "success"
              ? ("completed" as const)
              : workflow.status === "failed"
              ? ("failed" as const)
              : ("in-progress" as const),
          details: {
            workflowType: workflow.workflow_type,
            duration: workflow.execution_time,
            dataProcessed: workflow.data_processed,
            mode: workflow.mode || "real",
          },
        })) || []
      );
    } catch (error) {
      console.error("Erreur récupération workflows:", error);
      return [];
    }
  };

  const generateRealEvents = async (
    realData: unknown
  ): Promise<ProjectEvent[]> => {
    const events: ProjectEvent[] = [];

    try {
      if (
        systemStatus?.database === "connected" &&
        realData &&
        typeof realData === "object" &&
        realData !== null
      ) {
        const rd = realData as ProjectMetrics["realTimeData"];
        events.push({
          id: "db-connection",
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          type: "database",
          title: "Base de données Supabase connectée",
          description: `${rd.farms} fermes, ${rd.payments} paiements actifs`,
          status: "completed",
          details: rd,
        });
      }

      if (user) {
        const recentPayments = await database.getPaymentsByUser(user.id);
        const todayPayments = recentPayments.filter(
          (p) =>
            new Date(p.created_at).toDateString() === new Date().toDateString()
        );

        if (todayPayments.length > 0) {
          events.push({
            id: "recent-payments",
            timestamp: todayPayments[0].created_at,
            type: "integration",
            title: `${todayPayments.length} Paiement(s) traité(s)`,
            description: "Paiements d'assurance automatiques",
            status: "completed",
            details: {
              count: todayPayments.length,
              totalAmount: todayPayments.reduce((sum, p) => sum + p.amount, 0),
              currency: todayPayments[0].currency,
            },
          });
        }
      }

      if (
        realData &&
        typeof realData === "object" &&
        realData !== null &&
        (realData as ProjectMetrics["realTimeData"]).farms > 0 &&
        user
      ) {
        const farms = await database.getFarmsByUser(user.id);
        if (farms.length > 0) {
          const recentSensors = await database.getLatestSensorData(farms[0].id);
          if (recentSensors && recentSensors.length > 0) {
            const latestSensor = recentSensors[0];
            events.push({
              id: "sensor-data",
              timestamp: latestSensor.recorded_at,
              type: "integration",
              title: "Données capteurs reçues",
              description: `Capteurs IoT Irwise - Ferme ${farms[0].name}`,
              status: "completed",
              details: {
                farmName: farms[0].name,
                soilHumidity: latestSensor.soil_humidity,
                temperature: latestSensor.temperature,
                ph: latestSensor.ph_level,
                salinity: latestSensor.salinity,
              },
            });
          }
        }
      }

      const contractEvents = await getRecentContractEvents();
      events.push(...contractEvents);

      const workflowEvents = await getRecentWorkflowEvents();
      events.push(...workflowEvents);

      if (
        realData &&
        typeof realData === "object" &&
        realData !== null &&
        (realData as ProjectMetrics["realTimeData"]).farms > 0 &&
        user
      ) {
        const farms = await database.getFarmsByUser(user.id);
        if (farms.length > 0) {
          const predictions = await database.getRiskPredictions(farms[0].id);
          if (predictions && predictions.length > 0) {
            const latestPrediction = predictions[0];
            events.push({
              id: "ai-prediction",
              timestamp: latestPrediction.created_at ?? "",
              type: "integration",
              title: "Prédiction IA générée",
              description: `Risque ${latestPrediction.risk_type} détecté`,
              status: "completed",
              details: {
                riskType: latestPrediction.risk_type,
                probability: latestPrediction.probability,
                severity: latestPrediction.severity,
                validUntil: latestPrediction.valid_until,
              },
            });
          }
        }
      }

      return events.sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
    } catch (error) {
      console.error("Erreur génération événements:", error);
      return events;
    }
  };

  const calculateRealMetrics = async (
    realData: unknown,
    status: SystemStatus
  ): Promise<ProjectMetrics> => {
    try {
      const { data: contracts } = await supabase
        .from("smart_contracts")
        .select("id")
        .eq("status", "deployed");
      const { data: workflows } = await supabase
        .from("n8n_workflow_executions")
        .select("id")
        .gte(
          "executed_at",
          new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
        );

      const knownTables = [
        "profiles",
        "farms",
        "climate_events",
        "insurance_payments",
        "ai_agents",
        "sensor_data",
        "risk_predictions",
        "crop_recommendations",
        "smart_contracts",
        "n8n_workflow_executions",
        "system_events",
      ];

      let existingTablesCount = 0;
      for (const tableName of knownTables) {
        try {
          const { error } = await supabase
            .from(tableName)
            .select("id")
            .limit(1);
          if (!error) {
            existingTablesCount++;
          }
        } catch {
          // Table n'existe pas, continuer
        }
      }

      const connectedSystems = Object.values(status).filter(
        (s) => s === "connected"
      ).length;
      const totalSystems = Object.keys(status).length;
      const successRate = Math.round((connectedSystems / totalSystems) * 100);

      return {
        totalContracts: contracts?.length || 0,
        totalWorkflows: workflows?.length || 0,
        databaseTables: existingTablesCount || 8,
        integrations: connectedSystems,
        deployments: status.api === "operational" ? 1 : 0,
        successRate,
        realTimeData: (realData as ProjectMetrics["realTimeData"]) || {
          users: 0,
          farms: 0,
          climateEvents: 0,
          payments: 0,
          agents: 0,
          sensorReadings: 0,
        },
      };
    } catch (error) {
      console.error("Erreur calcul métriques:", error);
      const connectedSystems = Object.values(status).filter(
        (s) => s === "connected"
      ).length;
      const totalSystems = Object.keys(status).length;
      const successRate = Math.round((connectedSystems / totalSystems) * 100);

      return {
        totalContracts: 1,
        totalWorkflows: 5,
        databaseTables: 8,
        integrations: connectedSystems,
        deployments: status.api === "operational" ? 1 : 0,
        successRate,
        realTimeData: (realData as ProjectMetrics["realTimeData"]) || {
          users: 0,
          farms: 0,
          climateEvents: 0,
          payments: 0,
          agents: 0,
          sensorReadings: 0,
        },
      };
    }
  };

  const loadFallbackData = (): void => {
    setMetrics({
      totalContracts: 1,
      totalWorkflows: 5,
      databaseTables: 8,
      integrations: 2,
      deployments: 1,
      successRate: 75,
      realTimeData: {
        users: 1,
        farms: 0,
        climateEvents: 0,
        payments: 0,
        agents: 0,
        sensorReadings: 0,
      },
    });

    setProjectEvents([
      {
        id: "fallback",
        timestamp: new Date().toISOString(),
        type: "integration",
        title: "Mode hors ligne",
        description: "Données en cache utilisées",
        status: "in-progress",
        details: { mode: "offline" },
      },
    ]);
  };

  const getStatusIcon = (status: string): React.JSX.Element => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "in-progress":
        return <Clock className="h-4 w-4 text-blue-600" />;
      case "failed":
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTypeIcon = (type: string): React.JSX.Element => {
    switch (type) {
      case "database":
        return <Database className="h-5 w-5 text-blue-600" />;
      case "contract":
        return <Code className="h-5 w-5 text-purple-600" />;
      case "workflow":
        return <Workflow className="h-5 w-5 text-green-600" />;
      case "integration":
        return <Zap className="h-5 w-5 text-orange-600" />;
      case "deployment":
        return <Rocket className="h-5 w-5 text-red-600" />;
      default:
        return <Settings className="h-5 w-5 text-gray-600" />;
    }
  };

  const getTypeColor = (type: string): string => {
    switch (type) {
      case "database":
        return "bg-blue-100 text-blue-800";
      case "contract":
        return "bg-purple-100 text-purple-800";
      case "workflow":
        return "bg-green-100 text-green-800";
      case "integration":
        return "bg-orange-100 text-orange-800";
      case "deployment":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getSystemStatusBadge = (status: string): React.JSX.Element => {
    switch (status) {
      case "connected":
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Connecté
          </Badge>
        );
      case "disconnected":
        return (
          <Badge className="bg-orange-100 text-orange-800">
            <Clock className="h-3 w-3 mr-1" />
            Déconnecté
          </Badge>
        );
      case "error":
        return (
          <Badge className="bg-red-100 text-red-800">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Erreur
          </Badge>
        );
      case "operational":
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Opérationnel
          </Badge>
        );
      case "degraded":
        return (
          <Badge className="bg-orange-100 text-orange-800">
            <Clock className="h-3 w-3 mr-1" />
            Dégradé
          </Badge>
        );
      case "down":
        return (
          <Badge className="bg-red-100 text-red-800">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Hors ligne
          </Badge>
        );
      default:
        return <Badge variant="secondary">Inconnu</Badge>;
    }
  };

  const formatEventDetails = (
    details: Record<string, unknown>,
    type: string
  ): React.JSX.Element | null => {
    if (!details) return null;

    switch (type) {
      case "database":
        return (
          <div className="space-y-1">
            <div>
              <span className="font-medium">Fermes:</span>{" "}
              {(details.farms as number) || 0}
            </div>
            <div>
              <span className="font-medium">Paiements:</span>{" "}
              {(details.payments as number) || 0}
            </div>
            <div>
              <span className="font-medium">Agents IA:</span>{" "}
              {(details.agents as number) || 0}
            </div>
            <div>
              <span className="font-medium">Événements climatiques:</span>{" "}
              {(details.climateEvents as number) || 0}
            </div>
            <div>
              <span className="font-medium">Lectures capteurs:</span>{" "}
              {(details.sensorReadings as number) || 0}
            </div>
          </div>
        );

      case "contract":
        return (
          <div className="space-y-1">
            <div>
              <span className="font-medium">ID Contrat:</span>{" "}
              {details.contractId as string}
            </div>
            <div>
              <span className="font-medium">Réseau:</span>{" "}
              {details.network as string}
            </div>
            <div>
              <span className="font-medium">Gas utilisé:</span>{" "}
              {details.gasUsed as string}
            </div>
          </div>
        );

      case "workflow":
        return (
          <div className="space-y-1">
            <div>
              <span className="font-medium">Type:</span>{" "}
              {details.workflowType as string}
            </div>
            <div>
              <span className="font-medium">Mode:</span>{" "}
              {details.mode === "real" ? "Temps réel" : "Simulation"}
            </div>
          </div>
        );

      case "integration":
        return (
          <div className="space-y-1">
            <div>
              <span className="font-medium">Nombre d&apos;agents:</span>{" "}
              {(details.agentCount as number) || "N/A"}
            </div>
            <div>
              <span className="font-medium">Mode:</span>{" "}
              {details.mode === "offline" ? "Hors ligne" : "En ligne"}
            </div>
          </div>
        );

      default:
        return (
          <div className="space-y-1">
            {Object.entries(details).map(([key, value]) => (
              <div key={key}>
                <span className="font-medium capitalize">
                  {key.replace(/([A-Z])/g, " $1")}:
                </span>{" "}
                {String(value)}
              </div>
            ))}
          </div>
        );
    }
  };

  if (loading && !metrics) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Chargement des données en temps réel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête avec actualisation */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-green-800">
            Vue d&apos;ensemble du Projet AgriSure
          </h1>
          <p className="text-muted-foreground">
            Données en temps réel • Dernière mise à jour:{" "}
            {lastUpdate.toLocaleTimeString("fr-FR")}
          </p>
        </div>
        <Button
          onClick={loadRealProjectData}
          disabled={loading}
          variant="outline"
        >
          <RefreshCw
            className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
          />
          Actualiser
        </Button>
      </div>

      {/* Métriques en temps réel */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Tables DB</p>
                <p className="text-2xl font-bold text-blue-600">
                  {metrics?.databaseTables || 0}
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
                <p className="text-sm text-muted-foreground">Contrats</p>
                <p className="text-2xl font-bold text-purple-600">
                  {metrics?.totalContracts || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Workflow className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Workflows</p>
                <p className="text-2xl font-bold text-green-600">
                  {metrics?.totalWorkflows || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm text-muted-foreground">Intégrations</p>
                <p className="text-2xl font-bold text-orange-600">
                  {metrics?.integrations || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Rocket className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm text-muted-foreground">Déploiements</p>
                <p className="text-2xl font-bold text-red-600">
                  {metrics?.deployments || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Succès</p>
                <p className="text-2xl font-bold text-green-600">
                  {metrics?.successRate || 0}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Données temps réel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-blue-600" />
            Données en Temps Réel
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">
                {metrics?.realTimeData.users || 0}
              </p>
              <p className="text-sm text-muted-foreground">Utilisateurs</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {metrics?.realTimeData.farms || 0}
              </p>
              <p className="text-sm text-muted-foreground">Fermes</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">
                {metrics?.realTimeData.climateEvents || 0}
              </p>
              <p className="text-sm text-muted-foreground">Événements</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">
                {metrics?.realTimeData.payments || 0}
              </p>
              <p className="text-sm text-muted-foreground">Paiements</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">
                {metrics?.realTimeData.agents || 0}
              </p>
              <p className="text-sm text-muted-foreground">Agents IA</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-600">
                {metrics?.realTimeData.sensorReadings || 0}
              </p>
              <p className="text-sm text-muted-foreground">Capteurs</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* État des systèmes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-green-600" />
            État des Systèmes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Base de données</span>
              {systemStatus && getSystemStatusBadge(systemStatus.database)}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Hedera SDK</span>
              {systemStatus && getSystemStatusBadge(systemStatus.hedera)}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">n8n Workflows</span>
              {systemStatus && getSystemStatusBadge(systemStatus.n8n)}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">API</span>
              {systemStatus && getSystemStatusBadge(systemStatus.api)}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timeline des événements réels */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="timeline">Timeline Temps Réel</TabsTrigger>
          <TabsTrigger value="architecture">Architecture</TabsTrigger>
        </TabsList>

        <TabsContent value="timeline" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Timeline className="h-5 w-5 text-blue-600" />
                Événements en Temps Réel
              </CardTitle>
              <CardDescription>
                Activité récente du système AgriSure
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {projectEvents.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    Aucun événement récent. Utilisez l&apos;application pour générer
                    de l&apos;activité.
                  </p>
                ) : (
                  projectEvents.map((event, index) => (
                    <div
                      key={event.id}
                      className="flex gap-4 p-4 rounded-lg border"
                    >
                      <div className="flex flex-col items-center">
                        {getTypeIcon(event.type)}
                        {index < projectEvents.length - 1 && (
                          <div className="w-px h-16 bg-gray-200 mt-2"></div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{event.title}</h3>
                            <Badge className={getTypeColor(event.type)}>
                              {event.type}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(event.status)}
                            <span className="text-sm text-muted-foreground">
                              {new Date(event.timestamp).toLocaleString(
                                "fr-FR"
                              )}
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {event.description}
                        </p>
                        {event.details && (
                          <div className="bg-gray-50 p-3 rounded text-xs text-gray-700">
                            {formatEventDetails(event.details, event.type)}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="architecture" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Server className="h-5 w-5 text-blue-600" />
                  Stack Technique
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded">
                    <span className="font-medium">Frontend</span>
                    <Badge variant="secondary">Next.js 15 + React</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded">
                    <span className="font-medium">Base de données</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">Supabase PostgreSQL</Badge>
                      {systemStatus &&
                        getSystemStatusBadge(systemStatus.database)}
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded">
                    <span className="font-medium">Blockchain</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">Hedera Hashgraph</Badge>
                      {systemStatus &&
                        getSystemStatusBadge(systemStatus.hedera)}
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-orange-50 rounded">
                    <span className="font-medium">Automatisation</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">n8n Workflows</Badge>
                      {systemStatus && getSystemStatusBadge(systemStatus.n8n)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-green-600" />
                  Performance Temps Réel
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Taux de succès</span>
                      <span>{metrics?.successRate || 0}%</span>
                    </div>
                    <Progress
                      value={metrics?.successRate || 0}
                      className="h-2"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Systèmes connectés</span>
                      <span>{metrics?.integrations || 0}/4</span>
                    </div>
                    <Progress
                      value={((metrics?.integrations || 0) / 4) * 100}
                      className="h-2"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Données disponibles</span>
                      <span>
                        {(metrics?.realTimeData.farms || 0) > 0 ? "100" : "0"}%
                      </span>
                    </div>
                    <Progress
                      value={(metrics?.realTimeData.farms || 0) > 0 ? 100 : 0}
                      className="h-2"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
