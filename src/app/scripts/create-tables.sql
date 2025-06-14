-- Création des tables pour AgriSure
-- Base de données pour l'assurance climatique agricole

-- Table des utilisateurs
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    avatar_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des exploitations agricoles
CREATE TABLE IF NOT EXISTS farms (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    size_hectares DECIMAL(10,2),
    soil_type VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des événements climatiques
CREATE TABLE IF NOT EXISTS climate_events (
    id SERIAL PRIMARY KEY,
    farm_id INTEGER REFERENCES farms(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL, -- 'drought', 'flood', 'hail', etc.
    severity VARCHAR(20) NOT NULL, -- 'low', 'medium', 'high'
    start_date DATE NOT NULL,
    end_date DATE,
    description TEXT,
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des paiements d'assurance
CREATE TABLE IF NOT EXISTS insurance_payments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    climate_event_id INTEGER REFERENCES climate_events(id),
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'paid', 'failed'
    hedera_transaction_id VARCHAR(255),
    paid_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des recommandations de cultures
CREATE TABLE IF NOT EXISTS crop_recommendations (
    id SERIAL PRIMARY KEY,
    farm_id INTEGER REFERENCES farms(id) ON DELETE CASCADE,
    crop_name VARCHAR(100) NOT NULL,
    recommended_date DATE NOT NULL,
    reason TEXT,
    ai_confidence DECIMAL(5,2), -- Pourcentage de confiance de l'IA
    weather_data JSONB, -- Données météo utilisées
    soil_data JSONB, -- Données de sol Irwise
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des capteurs Irwise
CREATE TABLE IF NOT EXISTS sensor_data (
    id SERIAL PRIMARY KEY,
    farm_id INTEGER REFERENCES farms(id) ON DELETE CASCADE,
    sensor_type VARCHAR(50) NOT NULL, -- 'humidity', 'temperature', 'salinity'
    value DECIMAL(10,4) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    recorded_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des agents IA
CREATE TABLE IF NOT EXISTS ai_agents (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'weather', 'crop', 'risk', 'payment'
    status VARCHAR(20) DEFAULT 'active', -- 'active', 'inactive', 'error'
    last_run TIMESTAMP,
    accuracy_rate DECIMAL(5,2),
    total_predictions INTEGER DEFAULT 0,
    config JSONB, -- Configuration de l'agent
    n8n_workflow_id VARCHAR(255), -- ID du workflow n8n
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des prédictions de risques
CREATE TABLE IF NOT EXISTS risk_predictions (
    id SERIAL PRIMARY KEY,
    farm_id INTEGER REFERENCES farms(id) ON DELETE CASCADE,
    risk_type VARCHAR(50) NOT NULL,
    probability DECIMAL(5,2) NOT NULL, -- Pourcentage
    impact_level VARCHAR(20) NOT NULL, -- 'low', 'medium', 'high'
    prediction_date DATE NOT NULL,
    valid_until DATE NOT NULL,
    ai_agent_id INTEGER REFERENCES ai_agents(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index pour optimiser les performances
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_farms_user_id ON farms(user_id);
CREATE INDEX IF NOT EXISTS idx_climate_events_farm_id ON climate_events(farm_id);
CREATE INDEX IF NOT EXISTS idx_climate_events_date ON climate_events(start_date);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON insurance_payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON insurance_payments(status);
CREATE INDEX IF NOT EXISTS idx_sensor_data_farm_id ON sensor_data(farm_id);
CREATE INDEX IF NOT EXISTS idx_sensor_data_recorded_at ON sensor_data(recorded_at);
CREATE INDEX IF NOT EXISTS idx_risk_predictions_farm_id ON risk_predictions(farm_id);
CREATE INDEX IF NOT EXISTS idx_risk_predictions_date ON risk_predictions(prediction_date);
