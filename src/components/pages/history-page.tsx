"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Calendar,
  Search,
  Filter,
  Download,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  CloudRain,
  Coins,
  Brain,
  Zap,
  Activity,
} from "lucide-react";
import { database } from "@/lib/database";
import { useAuth } from "@/components/auth/auth-provider";

interface HistoryEvent {
  id: string;
  timestamp: string;
  type:
    | "climate"
    | "payment"
    | "sensor"
    | "prediction"
    | "contract"
    | "workflow";
  title: string;
  description: string;
  status: "success" | "warning" | "error" | "info";
  farmName?: string;
  amount?: number;
  details: Record<string, unknown>;
}

interface FilterOptions {
  type: string;
  status: string;
  farm: string;
  dateRange: string;
  search: string;
}

export function HistoryPage(): JSX.Element {
  const { user } = useAuth();
  const [events, setEvents] = useState<HistoryEvent[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<HistoryEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [farms, setFarms] = useState<{ id: string; name: string }[]>([]);
  const [filters, setFilters] = useState<FilterOptions>({
    type: "all",
    status: "all",
    farm: "all",
    dateRange: "7d",
    search: "",
  });
  const [activeTab, setActiveTab] = useState<string>("all");
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    loadHistoryData();

    // Auto-refresh toutes les 30 secondes
    const interval = setInterval(() => {
      if (user) {
        loadHistoryData();
      }
    }, 30000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    applyFilters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [events, filters, activeTab]);

  const loadHistoryData = async (): Promise<void> => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const userFarms = await database.getFarmsByUser(user.id);
      setFarms(userFarms);

      const allEvents: HistoryEvent[] = [];

      // 1. Événements climatiques
      try {
        for (const farm of userFarms) {
          const climateEvents = await database.getClimateEvents(farm.id);
          for (const event of climateEvents) {
            allEvents.push({
              id: `climate-${event.id}`,
              timestamp: event.start_date,
              type: "climate",
              title: `Événement climatique: ${event.event_type}`,
              description:
                event.description ||
                `${event.event_type} détecté sur ${farm.name}`,
              status:
                event.severity === "high"
                  ? "error"
                  : event.severity === "medium"
                  ? "warning"
                  : "info",
              farmName: farm.name,
              details: {
                eventType: event.event_type,
                severity: event.severity,
                verified: event.verified,
                endDate: event.end_date,
                farmLocation: farm.location,
              },
            });
          }
        }
      } catch (err) {
        
        console.error("Error loading climate events:", err);
      }

      // 2. Paiements d'assurance
      try {
        const payments = await database.getPaymentsByUser(user.id);
        for (const payment of payments) {
          allEvents.push({
            id: `payment-${payment.id}`,
            timestamp: payment.paid_at || payment.created_at,
            type: "payment",
            title: `Paiement d'assurance`,
            description: `Paiement de ${payment.amount} ${payment.currency} ${
              payment.status === "completed" ? "effectué" : "en cours"
            }`,
            status:
              payment.status === "completed"
                ? "success"
                : payment.status === "failed"
                ? "error"
                : "warning",
            amount: payment.amount,
            details: {
              amount: payment.amount,
              currency: payment.currency,
              status: payment.status,
              hederaTransactionId: payment.hedera_transaction_id,
              climateEventId: payment.climate_event_id,
            },
          });
        }
      } catch (err) {
        
        console.error("Error loading payments:", err);
      }

      // 3. Données des capteurs
      try {
        for (const farm of userFarms) {
          const sensorData = await database.getLatestSensorData(farm.id);
          if (sensorData && Array.isArray(sensorData)) {
            for (const reading of sensorData.slice(0, 10)) {
              allEvents.push({
                id: `sensor-${reading.id}`,
                timestamp: reading.recorded_at,
                type: "sensor",
                title: `Lecture capteur`,
                description: `Données capteur mises à jour sur ${farm.name}`,
                status: reading.soil_humidity < 10 ? "warning" : "success",
                farmName: farm.name,
                details: {
                  soilHumidity: reading.soil_humidity,
                  soilTemperature: reading.soil_temperature,
                  salinity: reading.salinity,
                  ph: reading.ph,
                  farmName: farm.name,
                },
              });
            }
          }
        }
      } catch (err) {
        
        console.error("Error loading sensor data:", err);
      }

      // 4. Prédictions de risques
      try {
        for (const farm of userFarms) {
          const predictions = await database.getRiskPredictions(farm.id);
          if (predictions && Array.isArray(predictions)) {
            for (const prediction of predictions.slice(0, 5)) {
              allEvents.push({
                id: `prediction-${prediction.id}`,
                timestamp: prediction.created_at,
                type: "prediction",
                title: `Prédiction de risque`,
                description: `Risque ${
                  prediction.risk_type
                } prédit avec ${Math.round(
                  prediction.probability * 100
                )}% de probabilité`,
                status:
                  prediction.probability > 0.7
                    ? "error"
                    : prediction.probability > 0.4
                    ? "warning"
                    : "info",
                farmName: farm.name,
                details: {
                  riskType: prediction.risk_type,
                  probability: prediction.probability,
                  validUntil: prediction.valid_until,
                  recommendations: prediction.recommendations,
                },
              });
            }
          }
        }
      } catch (err) {
        
        console.error("Error loading risk predictions:", err);
      }

      // 5. Recommandations de cultures
      try {
        for (const farm of userFarms) {
          const recommendations = await database.getCropRecommendations(
            farm.id
          );
          if (recommendations && Array.isArray(recommendations)) {
            for (const rec of recommendations.slice(0, 3)) {
              allEvents.push({
                id: `crop-${rec.id}`,
                timestamp: rec.recommended_date,
                type: "prediction",
                title: `Recommandation de culture`,
                description: `Culture ${rec.crop_type} recommandée avec score de ${rec.confidence_score}`,
                status: "info",
                farmName: farm.name,
                details: {
                  cropType: rec.crop_type,
                  confidenceScore: rec.confidence_score,
                  reasoning: rec.reasoning,
                  expectedYield: rec.expected_yield,
                },
              });
            }
          }
        }
      } catch (err) {
        
        console.error("Error loading crop recommendations:", err);
      }

      // Ajouter des événements simulés récents pour les contrats et workflows
      const recentContractEvents = generateRecentContractEvents();
      const recentWorkflowEvents = generateRecentWorkflowEvents();

      allEvents.push(...recentContractEvents, ...recentWorkflowEvents);

      // Trier par date (plus récent en premier)
      allEvents.sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      setEvents(allEvents);
      setLastUpdate(new Date());
    } catch (err) {
      
      console.error("Erreur lors du chargement de l'historique:", err);
      setError("Erreur lors du chargement des données");
    } finally {
      setLoading(false);
    }
  };

  const generateRecentContractEvents = (): HistoryEvent[] => {
    const now = new Date();
    return [
      {
        id: "contract-recent-1",
        timestamp: new Date(now.getTime() - 600000).toISOString(),
        type: "contract",
        title: "Smart Contract déployé",
        description: "Contrat d'assurance multi-risques déployé sur Hedera",
        status: "success",
        details: {
          contractId: "0.0.163887",
          type: "Assurance Multi-Risques",
          coverage: "1 HBAR",
          premium: "1 HBAR",
          network: "testnet",
        },
      },
      {
        id: "contract-recent-2",
        timestamp: new Date(now.getTime() - 1800000).toISOString(),
        type: "contract",
        title: "Génération de contrat IA",
        description: "Nouveau contrat généré automatiquement par l'IA",
        status: "info",
        details: {
          aiGenerated: true,
          template: "drought-insurance",
          optimizations: ["gas-efficiency", "security-audit"],
        },
      },
    ];
  };

  const generateRecentWorkflowEvents = (): HistoryEvent[] => {
    const now = new Date();
    return [
      {
        id: "workflow-recent-1",
        timestamp: new Date(now.getTime() - 300000).toISOString(),
        type: "workflow",
        title: "Workflow n8n déclenché",
        description: "Traitement automatique des données météo",
        status: "success",
        details: {
          workflowType: "weather-monitoring",
          executionTime: "2.3s",
          dataProcessed: 150,
        },
      },
      {
        id: "workflow-recent-2",
        timestamp: new Date(now.getTime() - 900000).toISOString(),
        type: "workflow",
        title: "Analyse prédictive",
        description: "Analyse des risques climatiques terminée",
        status: "warning",
        details: {
          workflowType: "risk-analysis",
          risksDetected: 2,
          alertsSent: 1,
        },
      },
    ];
  };

  const applyFilters = (): void => {
    let filtered = events;

    if (activeTab !== "all") {
      filtered = filtered.filter((event) => event.type === activeTab);
    }
    if (filters.type !== "all") {
      filtered = filtered.filter((event) => event.type === filters.type);
    }
    if (filters.status !== "all") {
      filtered = filtered.filter((event) => event.status === filters.status);
    }
    if (filters.farm !== "all") {
      filtered = filtered.filter((event) => event.farmName === filters.farm);
    }
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (event) =>
          event.title.toLowerCase().includes(searchLower) ||
          event.description.toLowerCase().includes(searchLower) ||
          (event.farmName && event.farmName.toLowerCase().includes(searchLower))
      );
    }
    const now = new Date();
    let dateLimit: Date;
    switch (filters.dateRange) {
      case "1d":
        dateLimit = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case "7d":
        dateLimit = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "30d":
        dateLimit = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case "90d":
        dateLimit = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        dateLimit = new Date(0);
    }
    if (filters.dateRange !== "all") {
      filtered = filtered.filter(
        (event) => new Date(event.timestamp) >= dateLimit
      );
    }
    setFilteredEvents(filtered);
  };

  const getEventIcon = (type: string): JSX.Element => {
    switch (type) {
      case "climate":
        return <CloudRain className="h-4 w-4" />;
      case "payment":
        return <Coins className="h-4 w-4" />;
      case "sensor":
        return <Activity className="h-4 w-4" />;
      case "prediction":
        return <Brain className="h-4 w-4" />;
      case "contract":
        return <Zap className="h-4 w-4" />;
      case "workflow":
        return <RefreshCw className="h-4 w-4" />;
      default:
        return <Calendar className="h-4 w-4" />;
    }
  };

  const getStatusIcon = (status: string): JSX.Element => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case "error":
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case "info":
        return <Clock className="h-4 w-4 text-blue-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string): JSX.Element => {
    switch (status) {
      case "success":
        return <Badge className="bg-green-100 text-green-800">Succès</Badge>;
      case "warning":
        return (
          <Badge className="bg-yellow-100 text-yellow-800">Attention</Badge>
        );
      case "error":
        return <Badge className="bg-red-100 text-red-800">Erreur</Badge>;
      case "info":
        return <Badge className="bg-blue-100 text-blue-800">Info</Badge>;
      default:
        return <Badge variant="secondary">Inconnu</Badge>;
    }
  };

  const getTypeBadge = (type: string): JSX.Element => {
    switch (type) {
      case "climate":
        return <Badge className="bg-blue-100 text-blue-800">Climat</Badge>;
      case "payment":
        return <Badge className="bg-green-100 text-green-800">Paiement</Badge>;
      case "sensor":
        return <Badge className="bg-purple-100 text-purple-800">Capteur</Badge>;
      case "prediction":
        return (
          <Badge className="bg-orange-100 text-orange-800">Prédiction</Badge>
        );
      case "contract":
        return <Badge className="bg-red-100 text-red-800">Contrat</Badge>;
      case "workflow":
        return (
          <Badge className="bg-yellow-100 text-yellow-800">Workflow</Badge>
        );
      default:
        return <Badge variant="secondary">{type}</Badge>;
    }
  };

  const exportData = (): void => {
    const csvContent = [
      [
        "Date",
        "Type",
        "Titre",
        "Description",
        "Statut",
        "Ferme",
        "Montant",
      ].join(","),
      ...filteredEvents.map((event) =>
        [
          new Date(event.timestamp).toLocaleString("fr-FR"),
          event.type,
          `"${event.title}"`,
          `"${event.description}"`,
          event.status,
          event.farmName || "",
          event.amount || "",
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `agrisure-historique-${
      new Date().toISOString().split("T")[0]
    }.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getEventCounts = (): Record<string, number> => {
    return {
      all: events.length,
      climate: events.filter((e) => e.type === "climate").length,
      payment: events.filter((e) => e.type === "payment").length,
      sensor: events.filter((e) => e.type === "sensor").length,
      prediction: events.filter((e) => e.type === "prediction").length,
      contract: events.filter((e) => e.type === "contract").length,
      workflow: events.filter((e) => e.type === "workflow").length,
    };
  };

  const counts = getEventCounts();

  const formatEventDetails = (event: HistoryEvent): JSX.Element => {
    switch (event.type) {
      case "climate":
        return (
          <div className="space-y-1 text-xs">
            <div>
              <span className="font-medium">Type:</span>{" "}
              {event.details.eventType as string}
            </div>
            <div>
              <span className="font-medium">Sévérité:</span>{" "}
              {event.details.severity as string}
            </div>
            <div>
              <span className="font-medium">Vérifié:</span>{" "}
              {event.details.verified ? "Oui" : "Non"}
            </div>
            {event.details.endDate && (
              <div>
                <span className="font-medium">Fin:</span>{" "}
                {new Date(event.details.endDate as string).toLocaleDateString(
                  "fr-FR"
                )}
              </div>
            )}
          </div>
        );

      case "payment":
        return (
          <div className="space-y-1 text-xs">
            <div>
              <span className="font-medium">Montant:</span>{" "}
              {event.details.amount as number}{" "}
              {event.details.currency as string}
            </div>
            <div>
              <span className="font-medium">Statut:</span>{" "}
              {event.details.status as string}
            </div>
            {event.details.hederaTransactionId && (
              <div>
                <span className="font-medium">TX ID:</span>{" "}
                {(event.details.hederaTransactionId as string).slice(0, 20)}...
              </div>
            )}
          </div>
        );

      case "sensor":
        return (
          <div className="space-y-1 text-xs">
            <div>
              <span className="font-medium">Humidité:</span>{" "}
              {event.details.soilHumidity as number}%
            </div>
            <div>
              <span className="font-medium">Température:</span>{" "}
              {event.details.soilTemperature as number}°C
            </div>
            <div>
              <span className="font-medium">pH:</span>{" "}
              {event.details.ph as number}
            </div>
            <div>
              <span className="font-medium">Salinité:</span>{" "}
              {event.details.salinity as number}
            </div>
          </div>
        );

      case "prediction":
        if (event.details.cropType) {
          return (
            <div className="space-y-1 text-xs">
              <div>
                <span className="font-medium">Culture:</span>{" "}
                {event.details.cropType as string}
              </div>
              <div>
                <span className="font-medium">Score:</span>{" "}
                {event.details.confidenceScore as number}/100
              </div>
              <div>
                <span className="font-medium">Rendement:</span>{" "}
                {event.details.expectedYield as string}
              </div>
            </div>
          );
        } else {
          return (
            <div className="space-y-1 text-xs">
              <div>
                <span className="font-medium">Risque:</span>{" "}
                {event.details.riskType as string}
              </div>
              <div>
                <span className="font-medium">Probabilité:</span>{" "}
                {Math.round((event.details.probability as number) * 100)}%
              </div>
              {event.details.validUntil && (
                <div>
                  <span className="font-medium">Valide jusqu&apos;au:</span>{" "}
                  {new Date(
                    event.details.validUntil as string
                  ).toLocaleDateString("fr-FR")}
                </div>
              )}
            </div>
          );
        }

      case "contract":
        return (
          <div className="space-y-1 text-xs">
            {event.details.contractId && (
              <div>
                <span className="font-medium">Contract ID:</span>{" "}
                {event.details.contractId as string}
              </div>
            )}
            {event.details.type && (
              <div>
                <span className="font-medium">Type:</span>{" "}
                {event.details.type as string}
              </div>
            )}
            {event.details.coverage && (
              <div>
                <span className="font-medium">Couverture:</span>{" "}
                {event.details.coverage as string}
              </div>
            )}
            {event.details.network && (
              <div>
                <span className="font-medium">Réseau:</span>{" "}
                {event.details.network as string}
              </div>
            )}
            {event.details.aiGenerated && (
              <div>
                <span className="font-medium">Généré par IA:</span> Oui
              </div>
            )}
          </div>
        );

      case "workflow":
        return (
          <div className="space-y-1 text-xs">
            <div>
              <span className="font-medium">Type:</span>{" "}
              {event.details.workflowType as string}
            </div>
            {event.details.executionTime && (
              <div>
                <span className="font-medium">Durée:</span>{" "}
                {event.details.executionTime as string}
              </div>
            )}
            {event.details.dataProcessed && (
              <div>
                <span className="font-medium">Données:</span>{" "}
                {event.details.dataProcessed as number} éléments
              </div>
            )}
            {event.details.risksDetected && (
              <div>
                <span className="font-medium">Risques détectés:</span>{" "}
                {event.details.risksDetected as number}
              </div>
            )}
          </div>
        );

      default:
        return (
          <div className="text-xs text-muted-foreground">
            Aucun détail disponible
          </div>
        );
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">
          Veuillez vous connecter pour voir l&apos;historique.
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 flex-col gap-4">
        <p className="text-red-600">Erreur: {error}</p>
        <Button
          onClick={() => {
            setError(null);
            loadHistoryData();
          }}
        >
          Réessayer
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-green-800">
            Historique des Activités
          </h1>
          <p className="text-muted-foreground">
            {filteredEvents.length} événements • Dernière mise à jour:{" "}
            {lastUpdate.toLocaleTimeString("fr-FR")}
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={exportData} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exporter CSV
          </Button>
          <Button
            onClick={loadHistoryData}
            disabled={loading}
            variant="outline"
            size="sm"
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
            />
            Actualiser
          </Button>
        </div>
      </div>

      {/* Filtres */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtres
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Recherche</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher..."
                  value={filters.search}
                  onChange={(e) =>
                    setFilters({ ...filters, search: e.target.value })
                  }
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Type</label>
              <Select
                value={filters.type}
                onValueChange={(value) =>
                  setFilters({ ...filters, type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les types</SelectItem>
                  <SelectItem value="climate">
                    Événements climatiques
                  </SelectItem>
                  <SelectItem value="payment">Paiements</SelectItem>
                  <SelectItem value="sensor">Données capteurs</SelectItem>
                  <SelectItem value="prediction">Prédictions</SelectItem>
                  <SelectItem value="contract">Smart Contracts</SelectItem>
                  <SelectItem value="workflow">Workflows</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Statut</label>
              <Select
                value={filters.status}
                onValueChange={(value) =>
                  setFilters({ ...filters, status: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="success">Succès</SelectItem>
                  <SelectItem value="warning">Attention</SelectItem>
                  <SelectItem value="error">Erreur</SelectItem>
                  <SelectItem value="info">Information</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Ferme</label>
              <Select
                value={filters.farm}
                onValueChange={(value) =>
                  setFilters({ ...filters, farm: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les fermes</SelectItem>
                  {farms.map((farm) => (
                    <SelectItem key={farm.id} value={farm.name}>
                      {farm.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Période</label>
              <Select
                value={filters.dateRange}
                onValueChange={(value) =>
                  setFilters({ ...filters, dateRange: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1d">Dernières 24h</SelectItem>
                  <SelectItem value="7d">7 derniers jours</SelectItem>
                  <SelectItem value="30d">30 derniers jours</SelectItem>
                  <SelectItem value="90d">90 derniers jours</SelectItem>
                  <SelectItem value="all">Toute la période</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Onglets par type d'événement */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="all">Tout ({counts.all})</TabsTrigger>
          <TabsTrigger value="climate">Climat ({counts.climate})</TabsTrigger>
          <TabsTrigger value="payment">
            Paiements ({counts.payment})
          </TabsTrigger>
          <TabsTrigger value="sensor">Capteurs ({counts.sensor})</TabsTrigger>
          <TabsTrigger value="prediction">IA ({counts.prediction})</TabsTrigger>
          <TabsTrigger value="contract">
            Contrats ({counts.contract})
          </TabsTrigger>
          <TabsTrigger value="workflow">
            Workflows ({counts.workflow})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <RefreshCw className="h-6 w-6 animate-spin mr-2" />
              <span>Chargement de l&apos;historique...</span>
            </div>
          ) : filteredEvents.length === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center h-32">
                <p className="text-muted-foreground">
                  Aucun événement trouvé avec ces filtres.
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Événements ({filteredEvents.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Événement</TableHead>
                      <TableHead>Ferme</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Détails</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEvents.slice(0, 50).map((event) => (
                      <TableRow key={event.id}>
                        <TableCell className="font-mono text-sm">
                          {new Date(event.timestamp).toLocaleString("fr-FR")}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getEventIcon(event.type)}
                            {getTypeBadge(event.type)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{event.title}</p>
                            <p className="text-sm text-muted-foreground">
                              {event.description}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>{event.farmName || "-"}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(event.status)}
                            {getStatusBadge(event.status)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs">
                            {formatEventDetails(event)}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {filteredEvents.length > 50 && (
                  <div className="text-center mt-4 text-sm text-muted-foreground">
                    Affichage des 50 premiers événements sur{" "}
                    {filteredEvents.length}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
