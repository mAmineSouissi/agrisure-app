// User and Authentication Types
export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  created_at: string;
  updated_at?: string;
}

export interface Profile {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

// Farm and Agricultural Data Types
export interface Farm {
  id: number;
  user_id: string;
  name: string;
  location: string;
  size_hectares: number;
  soil_type: string;
  created_at: string;
}

export interface ClimateEvent {
  id: number;
  farm_id: number;
  event_type: string;
  severity: string;
  start_date: string;
  end_date?: string;
  description: string;
  verified: boolean;
  created_at: string;
}

export interface WeatherData {
  temperature: number;
  humidity: number;
  rainfall: number;
  precipitation: number;
  windSpeed: number;
}

export interface SoilData {
  ph: number;
  moisture: number;
  nitrogen: number;
  ph_level?: number;
  soil_humidity?: number;
  soilHumidity?: number;
  soilTemperature?: number;
  salinity?: number;
}

export interface SensorData {
  id: number;
  farm_id: number;
  sensor_type?: string;
  value?: number;
  unit?: string;
  soil_humidity?: number;
  temperature?: number;
  ph_level?: number;
  salinity?: number;
  recorded_at: string;
  created_at?: string;
}

export interface CropRecommendation {
  id: number;
  farm_id?: number;
  crop_name?: string;
  crop?: string;
  recommended_date?: string;
  plantingDate?: string;
  reason?: string;
  confidence?: number;
  ai_confidence?: number;
  weather_data?: WeatherData;
  soil_data?: SoilData;
  created_at?: string;
}

export interface RiskPrediction {
  id: number;
  farm_id?: number;
  risk_type?: string;
  probability?: number;
  severity?: string;
  valid_until?: string;
  description?: string;
  created_at?: string;
}

// Insurance and Payment Types
export interface InsurancePayment {
  id: number;
  user_id: string;
  climate_event_id: number;
  amount: number;
  currency: string;
  status: string;
  hedera_transaction_id?: string;
  paid_at?: string;
  created_at: string;
}

// AI and Automation Types
export interface AIAgent {
  id: number;
  name: string;
  type: string;
  status: string;
  last_run?: string;
  accuracy_rate: number;
  total_predictions: number;
  config?: Record<string, unknown>;
  n8n_workflow_id?: string;
  created_at: string;
  updated_at: string;
}

// Blockchain and Smart Contract Types
export interface SmartContract {
  id: number;
  user_id: string;
  contract_type: string;
  contract_address: string;
  blockchain_network: string;
  coverage_amount: number;
  status: string;
  deployment_hash: string;
  created_at?: string;
  deployed_at?: string;
}

// N8n Workflow Types
export interface N8nWorkflow {
  id: string;
  name: string;
  active: boolean;
  nodes: unknown[];
}

export interface N8nWorkflowExecution {
  id: number;
  workflow_name: string;
  workflow_type: string;
  status: string;
  executed_at?: string;
  execution_time: number;
  data_processed?: DataProcessed;
  mode: string;
  description?: string;
  created_at?: string;
}

export interface DataProcessed {
  records: number;
  size_mb: number;
  success: boolean;
  [key: string]: number | string | boolean;
}

// System and Event Types
export interface EventDetails {
  [key: string]:
    | string
    | number
    | boolean
    | null
    | EventDetails
    | EventDetails[];
}

export interface SystemEvent {
  id: number;
  event_type: string;
  title: string;
  description: string;
  status: string;
  details?: EventDetails | null;
  user_id: string;
  created_at?: string | null;
}

// Dashboard and UI Types
export interface DashboardData {
  farms: Farm[];
  payments: InsurancePayment[];
  agents: AIAgent[];
  climateEvents: ClimateEvent[];
  recommendations: CropRecommendation[];
  sensorData: SensorData[];
  riskPredictions: RiskPrediction[];
}

export interface ProjectEvent {
  id: string;
  timestamp: string;
  type: "integration" | "blockchain" | "ai" | "sensor" | "workflow";
  title: string;
  description: string;
  status: "completed" | "pending" | "error" | "success" | "warning" | "info";
  details?: Record<string, unknown>;
}

export interface HistoryEvent {
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

// Message and Chat Types
export interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
  suggestions?: string[];
}
