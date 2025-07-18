import type {
  N8nWorkflow,
  WeatherData,
  SensorData,
  CropRecommendation,
} from "./types";

interface Anomaly {
  type: string;
  soilHumidity: number;
  precipitation: number;
  temperature: number;
}

export class N8nService {
  private baseUrl: string;
  private apiKey: string;

  constructor() {
    this.baseUrl = process.env.N8N_BASE_URL || "http://localhost:5678";
    this.apiKey = process.env.N8N_API_KEY || "";
  }

  async triggerWeatherMonitoring(farmId: number): Promise<void> {
    try {
      const webhookUrl = `${this.baseUrl}/webhook/weather-monitoring`;
      console.log(`🌤️ Déclenchement surveillance météo pour ferme ${farmId}`);

      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          farmId,
          latitude: 45.5017,
          longitude: -73.5673,
          timestamp: new Date().toISOString(),
          action: "start_monitoring",
        }),
      });

      if (!response.ok) {
        console.warn(
          `⚠️ Webhook météo non disponible (${response.status}), simulation activée`
        );
        this.simulateWeatherResponse(farmId);
        return;
      }

      const data = await response.json();
      console.log(
        `✅ Surveillance météo déclenchée pour la ferme ${farmId}:`,
        data.message
      );
    } catch (error) {
      console.warn(
        "⚠️ n8n non disponible, simulation de la surveillance météo:",
        error
      );
      this.simulateWeatherResponse(farmId);
    }
  }

  async processSensorData(sensorData: SensorData): Promise<void> {
    try {
      const webhookUrl = `${this.baseUrl}/webhook/sensor-data-processing`;
      console.log(
        `📊 Traitement données capteurs pour ferme ${sensorData.farm_id}`
      );

      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...sensorData,
          source: "irwise_sensors",
        }),
      });

      if (!response.ok) {
        console.warn(
          `⚠️ Webhook capteurs non disponible (${response.status}), simulation activée`
        );
        this.simulateSensorResponse(sensorData);
        return;
      }

      const data = await response.json();

      if (data.anomalyDetected) {
        console.log(
          `🚨 Anomalie détectée pour ferme ${sensorData.farm_id}:`,
          data.anomalies
        );
        await this.triggerAlertWorkflow(sensorData.farm_id, data.anomalies[0]);
      }

      console.log(
        "✅ Données de capteurs traitées:",
        data.message || "Traitement réussi"
      );
    } catch (error) {
      console.warn(
        "⚠️ n8n non disponible, simulation du traitement capteurs:",
        error
      );
      this.simulateSensorResponse(sensorData);
    }
  }

  async triggerAlertWorkflow(farmId: number, anomaly: unknown): Promise<void> {
    try {
      const webhookUrl = `${this.baseUrl}/webhook/climate-alert`;
      console.log(`🚨 Déclenchement alerte pour ferme ${farmId}`);

      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          farmId,
          anomaly,
          severity: this.calculateSeverity(anomaly),
          timestamp: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        console.warn(`⚠️ Webhook alerte non disponible (${response.status})`);
        return;
      }

      console.log(`✅ Alerte déclenchée pour la ferme ${farmId}`);
    } catch (error) {
      console.warn("⚠️ Erreur lors du déclenchement de l'alerte:", error);
    }
  }

  async generateCropRecommendations(
    farmId: number,
    weatherData: WeatherData,
    soilData: SensorData
  ): Promise<CropRecommendation[]> {
    try {
      const webhookUrl = `${this.baseUrl}/webhook/ai-crop-recommendations`;
      console.log(`🌱 Génération recommandations pour ferme ${farmId}`);

      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          farmId,
          weatherData,
          soilData,
          timestamp: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        console.warn(
          `⚠️ Webhook recommandations non disponible, simulation activée`
        );
        return this.simulateCropRecommendations(farmId, weatherData, soilData);
      }

      const data = await response.json();
      console.log(
        "✅ Recommandations générées:",
        data.recommendations?.length || 0,
        "recommandations"
      );
      return data.recommendations || [];
    } catch (error) {
      console.warn(
        "⚠️ Erreur lors de la génération de recommandations:",
        error
      );
      return this.simulateCropRecommendations(farmId, weatherData, soilData);
    }
  }

  async triggerAutomaticPayment(
    farmerId: string,
    amount: number,
    eventType: string
  ): Promise<void> {
    try {
      const webhookUrl = `${this.baseUrl}/webhook/hedera-payment`;
      console.log(
        `💰 Déclenchement paiement automatique: ${amount}$ pour ${farmerId}`
      );

      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          farmerId,
          amount,
          eventType,
          timestamp: new Date().toISOString(),
          blockchain: "hedera",
        }),
      });

      if (!response.ok) {
        console.warn(
          `⚠️ Webhook paiement non disponible (${response.status}), simulation activée`
        );
        this.simulatePaymentResponse(farmerId, amount, eventType);
        return;
      }

      const data = await response.json();
      console.log(
        `✅ Paiement automatique déclenché:`,
        data.transactionId || "Simulation"
      );
    } catch (error) {
      console.warn("⚠️ Erreur lors du déclenchement du paiement:", error);
      this.simulatePaymentResponse(farmerId, amount, eventType);
    }
  }

  async triggerContractDeployment(
    contractId: string,
    contractType: string,
    coverage: number
  ): Promise<void> {
    try {
      const webhookUrl = `${this.baseUrl}/webhook/contract-deployed`;
      console.log(
        `📋 Déclenchement workflow déploiement contrat: ${contractId}`
      );

      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contractId,
          contractType,
          coverage,
          timestamp: new Date().toISOString(),
          blockchain: "hedera",
          status: "deployed",
        }),
      });

      if (!response.ok) {
        console.warn(
          `⚠️ Webhook déploiement contrat non disponible (${response.status}), simulation activée`
        );
        this.simulateContractDeployment(contractId, contractType, coverage);
        return;
      }

      const data = await response.json();
      console.log(
        `✅ Workflow déploiement contrat déclenché:`,
        data.message || "Déploiement notifié"
      );
    } catch (error) {
      console.warn(
        "⚠️ Erreur lors du déclenchement du workflow de déploiement:",
        error
      );
      this.simulateContractDeployment(contractId, contractType, coverage);
    }
  }

  private calculateSeverity(anomaly: unknown): number {
    const isAnomaly = (obj: unknown): obj is Anomaly => {
      return (
        typeof obj === "object" &&
        obj !== null &&
        "type" in obj &&
        "soilHumidity" in obj &&
        "precipitation" in obj &&
        "temperature" in obj
      );
    };

    if (isAnomaly(anomaly)) {
      if (anomaly.type === "drought" && anomaly.soilHumidity < 10) return 9;
      if (anomaly.type === "flood" && anomaly.precipitation > 100) return 8;
      if (anomaly.type === "temperature" && anomaly.temperature > 40) return 7;
    }
    return 5;
  }

  async getWorkflowStatus(): Promise<N8nWorkflow[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/workflows`, {
        headers: {
          "X-N8N-API-KEY": this.apiKey,
        },
      });

      if (!response.ok) {
        console.warn("⚠️ API n8n non disponible, retour de workflows simulés");
        return this.getSimulatedWorkflows();
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.warn(
        "⚠️ Erreur lors de la récupération du statut des workflows:",
        error
      );
      return this.getSimulatedWorkflows();
    }
  }

  private simulateWeatherResponse(farmId: number): void {
    console.log(
      `🌤️ [SIMULATION] Surveillance météo activée pour ferme ${farmId}`
    );
    console.log(
      `📊 [SIMULATION] Conditions: Température 28°C, Humidité 45%, Vent 8km/h`
    );
  }

  private simulateSensorResponse(sensorData: SensorData): void {
    console.log(
      `📊 [SIMULATION] Données capteurs traitées pour ferme ${sensorData.farm_id}`
    );
    console.log(
      `🌱 [SIMULATION] Sol: ${sensorData.soil_humidity || 0}% humidité, ${
        sensorData.temperature || 0
      }°C`
    );
    if ((sensorData.soil_humidity || 0) < 15) {
      console.log(
        `🚨 [SIMULATION] Anomalie détectée: Sécheresse (humidité ${
          sensorData.soil_humidity || 0
        }%)`
      );
    }
  }

  private simulatePaymentResponse(
    farmerId: string,
    amount: number,
    eventType: string
  ): void {
    const txId = `SIM_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    console.log(`💰 [SIMULATION] Paiement ${amount}$ pour ${farmerId}`);
    console.log(`🔗 [SIMULATION] Transaction ID: ${txId}`);
    console.log(`📝 [SIMULATION] Événement: ${eventType}`);
  }

  private simulateCropRecommendations(
    farmId: number,
    _weatherData: WeatherData,
    _soilData: SensorData
  ): CropRecommendation[] {
    // Use parameters to avoid lint error
    void _weatherData;
    void _soilData;

    console.log(
      `🌱 [SIMULATION] Génération recommandations pour ferme ${farmId}`
    );

    const recommendations: CropRecommendation[] = [
      {
        id: 1,
        farm_id: farmId,
        crop: "Sorgho",
        ai_confidence: 94,
        reason: "Résistant à la sécheresse, adapté aux conditions actuelles",
        plantingDate: "2025-06-20",
      },
      {
        id: 2,
        farm_id: farmId,
        crop: "Mil",
        ai_confidence: 87,
        reason: "Excellente résistance à la chaleur",
        plantingDate: "2025-06-25",
      },
    ];

    console.log(
      `✅ [SIMULATION] ${recommendations.length} recommandations générées`
    );
    return recommendations;
  }

  private getSimulatedWorkflows(): N8nWorkflow[] {
    return [
      {
        id: "weather-monitoring",
        name: "AgriSure Weather Monitoring",
        active: true,
        nodes: [],
      },
      {
        id: "sensor-processing",
        name: "AgriSure Sensor Processing",
        active: true,
        nodes: [],
      },
      {
        id: "hedera-payment",
        name: "AgriSure Hedera Payment",
        active: true,
        nodes: [],
      },
    ];
  }

  private simulateContractDeployment(
    contractId: string,
    contractType: string,
    coverage: number
  ): void {
    console.log(`📋 [SIMULATION] Contrat déployé: ${contractId}`);
    console.log(`📝 [SIMULATION] Type: ${contractType}`);
    console.log(`💰 [SIMULATION] Couverture: ${coverage}$`);
    console.log(`🔗 [SIMULATION] Blockchain: Hedera Testnet`);
    console.log(`📊 [SIMULATION] Notifications envoyées aux parties prenantes`);
  }
}

export const n8nService = new N8nService();
