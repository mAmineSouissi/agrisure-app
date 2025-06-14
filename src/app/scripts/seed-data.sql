-- Script de données de test pour AgriSure
-- Remplacez 'VOTRE-USER-ID-ICI' par votre vrai UUID depuis Authentication > Users

-- IMPORTANT: Remplacez cette ligne par votre vrai User ID
-- Exemple: SET @user_id = '12345678-1234-1234-1234-123456789012';
-- Vous devez remplacer TOUTES les occurrences de 'VOTRE-USER-ID-ICI' par votre UUID

-- 1. Ajouter des fermes de test
INSERT INTO farms (user_id, name, location, size_hectares, soil_type) VALUES
('b4afd15e-4dee-43fd-8fba-eb6582163f89', 'Ferme AgriSure Demo', 'Région Centre, France', 25.5, 'Argilo-limoneux'),
('b4afd15e-4dee-43fd-8fba-eb6582163f89', 'Parcelle Nord', 'Région Centre, France', 12.3, 'Sableux'),
('b4afd15e-4dee-43fd-8fba-eb6582163f89', 'Domaine Sud', 'Provence, France', 18.7, 'Calcaire');

-- 2. Ajouter des événements climatiques historiques
-- (Les IDs des fermes seront probablement 1, 2, 3 - ajustez si nécessaire)
INSERT INTO climate_events (farm_id, event_type, severity, start_date, end_date, description, verified) VALUES
-- Événements pour la ferme 1
(1, 'drought', 'high', '2025-06-13', '2025-06-20', 'Période de sécheresse de 7 jours consécutifs détectée par capteurs Irwise', true),
(1, 'flood', 'medium', '2025-04-15', '2025-04-16', 'Précipitations excessives (120mm en 24h) confirmées par station météo', true),
(1, 'hail', 'low', '2025-03-02', '2025-03-02', 'Grêle de 2cm de diamètre pendant 15 minutes', true),
(1, 'drought', 'medium', '2025-01-18', '2025-01-23', 'Période de sécheresse de 5 jours', true),
-- Événements pour la ferme 2
(2, 'flood', 'high', '2025-05-10', '2025-05-12', 'Inondation majeure suite à fortes pluies', true),
(2, 'drought', 'medium', '2025-02-20', '2025-02-25', 'Sécheresse modérée de 5 jours', true),
-- Événements pour la ferme 3
(3, 'hail', 'high', '2025-04-08', '2025-04-08', 'Grêle destructrice de 4cm de diamètre', true);

-- 3. Ajouter des paiements d'assurance automatiques via Hedera
INSERT INTO insurance_payments (user_id, climate_event_id, amount, status, hedera_transaction_id, paid_at) VALUES
('b4afd15e-4dee-43fd-8fba-eb6582163f89', 1, 50.00, 'paid', 'HBAR_TX_001_2025_06_13', '2025-06-14 10:30:00'),
('b4afd15e-4dee-43fd-8fba-eb6582163f89', 2, 75.00, 'paid', 'HBAR_TX_002_2025_04_16', '2025-04-17 14:15:00'),
('b4afd15e-4dee-43fd-8fba-eb6582163f89', 3, 30.00, 'paid', 'HBAR_TX_003_2025_03_03', '2025-03-04 09:45:00'),
('b4afd15e-4dee-43fd-8fba-eb6582163f89', 4, 45.00, 'paid', 'HBAR_TX_004_2025_01_24', '2025-01-25 16:20:00'),
('b4afd15e-4dee-43fd-8fba-eb6582163f89', 5, 120.00, 'paid', 'HBAR_TX_005_2025_05_13', '2025-05-14 11:10:00'),
('b4afd15e-4dee-43fd-8fba-eb6582163f89', 6, 35.00, 'paid', 'HBAR_TX_006_2025_02_26', '2025-02-27 08:45:00'),
('b4afd15e-4dee-43fd-8fba-eb6582163f89', 7, 95.00, 'paid', 'HBAR_TX_007_2025_04_09', '2025-04-10 16:30:00');

-- 4. Ajouter des recommandations de cultures basées sur l'IA
INSERT INTO crop_recommendations (farm_id, crop_name, recommended_date, reason, ai_confidence, weather_data, soil_data) VALUES
-- Recommandations pour la ferme 1
(1, 'Sorgho', '2025-06-20', 'Résistant à la sécheresse, adapté aux conditions actuelles selon analyse IA', 94.5, 
 '{"temperature": 32, "humidity": 15, "precipitation_forecast": "low", "wind_speed": 12}',
 '{"ph": 6.8, "humidity": 15, "salinity": 0.2, "nitrogen": 45, "phosphorus": 23}'),
(1, 'Mil', '2025-06-25', 'Excellente résistance à la chaleur et faible besoin en eau', 87.2,
 '{"temperature": 31, "humidity": 18, "precipitation_forecast": "very_low", "wind_speed": 8}',
 '{"ph": 6.9, "humidity": 18, "salinity": 0.15, "nitrogen": 42, "phosphorus": 28}'),
-- Recommandations pour la ferme 2
(2, 'Tournesol', '2025-07-01', 'Bonne résistance à la chaleur et rendement élevé prévu', 91.8,
 '{"temperature": 29, "humidity": 22, "precipitation_forecast": "moderate", "wind_speed": 15}',
 '{"ph": 7.1, "humidity": 22, "salinity": 0.1, "nitrogen": 38, "phosphorus": 31}'),
(2, 'Maïs résistant', '2025-07-10', 'Variété adaptée aux conditions climatiques changeantes', 89.3,
 '{"temperature": 28, "humidity": 25, "precipitation_forecast": "moderate", "wind_speed": 10}',
 '{"ph": 7.0, "humidity": 25, "salinity": 0.12, "nitrogen": 52, "phosphorus": 35}'),
-- Recommandations pour la ferme 3
(3, 'Lavande', '2025-08-01', 'Parfaitement adaptée au climat méditerranéen et sol calcaire', 96.1,
 '{"temperature": 30, "humidity": 20, "precipitation_forecast": "low", "wind_speed": 18}',
 '{"ph": 7.8, "humidity": 20, "salinity": 0.08, "nitrogen": 25, "phosphorus": 18}');

-- 5. Ajouter des prédictions de risques actuelles
INSERT INTO risk_predictions (farm_id, risk_type, probability, impact_level, prediction_date, valid_until, ai_agent_id) VALUES
-- Prédictions pour la ferme 1
(1, 'drought', 70.00, 'high', CURRENT_DATE, CURRENT_DATE + INTERVAL '7' DAY, 3),
(1, 'flood', 20.00, 'medium', CURRENT_DATE, CURRENT_DATE + INTERVAL '7' DAY, 3),
(1, 'hail', 15.00, 'low', CURRENT_DATE, CURRENT_DATE + INTERVAL '7' DAY, 3),
(1, 'frost', 5.00, 'low', CURRENT_DATE, CURRENT_DATE + INTERVAL '14' DAY, 3),
-- Prédictions pour la ferme 2
(2, 'drought', 45.00, 'medium', CURRENT_DATE, CURRENT_DATE + INTERVAL '7' DAY, 3),
(2, 'flood', 35.00, 'medium', CURRENT_DATE, CURRENT_DATE + INTERVAL '7' DAY, 3),
(2, 'hail', 25.00, 'medium', CURRENT_DATE, CURRENT_DATE + INTERVAL '7' DAY, 3),
(2, 'wind_damage', 30.00, 'medium', CURRENT_DATE, CURRENT_DATE + INTERVAL '5' DAY, 3),
-- Prédictions pour la ferme 3
(3, 'drought', 25.00, 'low', CURRENT_DATE, CURRENT_DATE + INTERVAL '7' DAY, 3),
(3, 'flood', 60.00, 'high', CURRENT_DATE, CURRENT_DATE + INTERVAL '7' DAY, 3),
(3, 'hail', 40.00, 'medium', CURRENT_DATE, CURRENT_DATE + INTERVAL '7' DAY, 3),
(3, 'fire_risk', 55.00, 'high', CURRENT_DATE, CURRENT_DATE + INTERVAL '10' DAY, 3);

-- 6. Ajouter des données de capteurs Irwise récentes
INSERT INTO sensor_data (farm_id, sensor_type, value, unit, recorded_at) VALUES
-- Données récentes pour la ferme 1 (conditions sèches)
(1, 'humidity', 15.2, '%', SYSDATE - INTERVAL '1' HOUR),
(1, 'humidity', 14.8, '%', SYSDATE - INTERVAL '2' HOUR),
(1, 'humidity', 16.1, '%', SYSDATE - INTERVAL '3' HOUR),
(1, 'humidity', 13.9, '%', SYSDATE - INTERVAL '4' HOUR),
(1, 'temperature', 28.5, '°C', SYSDATE - INTERVAL '1' HOUR),
(1, 'temperature', 27.9, '°C', SYSDATE - INTERVAL '2' HOUR),
(1, 'temperature', 29.2, '°C', SYSDATE - INTERVAL '3' HOUR),
(1, 'temperature', 30.1, '°C', SYSDATE - INTERVAL '4' HOUR),
(1, 'salinity', 0.18, 'dS/m', SYSDATE - INTERVAL '1' HOUR),
(1, 'salinity', 0.19, 'dS/m', SYSDATE - INTERVAL '2' HOUR),
(1, 'salinity', 0.17, 'dS/m', SYSDATE - INTERVAL '3' HOUR),
-- Données pour la ferme 2 (conditions normales)
(2, 'humidity', 22.1, '%', SYSDATE - INTERVAL '30' MINUTE),
(2, 'humidity', 21.8, '%', SYSDATE - INTERVAL '1' HOUR),
(2, 'humidity', 23.2, '%', SYSDATE - INTERVAL '90' MINUTE),
(2, 'temperature', 26.3, '°C', SYSDATE - INTERVAL '30' MINUTE),
(2, 'temperature', 25.9, '°C', SYSDATE - INTERVAL '1' HOUR),
(2, 'temperature', 27.1, '°C', SYSDATE - INTERVAL '90' MINUTE),
(2, 'salinity', 0.12, 'dS/m', SYSDATE - INTERVAL '30' MINUTE),
(2, 'salinity', 0.11, 'dS/m', SYSDATE - INTERVAL '1' HOUR),
-- Données pour la ferme 3 (conditions méditerranéennes)
(3, 'humidity', 18.5, '%', SYSDATE - INTERVAL '45' MINUTE),
(3, 'humidity', 19.2, '%', SYSDATE - INTERVAL '1' HOUR - INTERVAL '15' MINUTE),
(3, 'temperature', 31.2, '°C', SYSDATE - INTERVAL '45' MINUTE),
(3, 'temperature', 30.8, '°C', SYSDATE - INTERVAL '1' HOUR - INTERVAL '15' MINUTE),
(3, 'salinity', 0.08, 'dS/m', SYSDATE - INTERVAL '45' MINUTE);

-- 7. Mettre à jour les statistiques des agents IA
UPDATE ai_agents SET 
    total_predictions = total_predictions + 15,
    last_run = SYSDATE - INTERVAL '2' MINUTE
WHERE type = 'risk';

UPDATE ai_agents SET 
    total_predictions = total_predictions + 8,
    last_run = SYSDATE - INTERVAL '5' MINUTE
WHERE type = 'crop';

UPDATE ai_agents SET 
    total_predictions = total_predictions + 25,
    last_run = SYSDATE - INTERVAL '1' MINUTE
WHERE type = 'weather';

-- Messages de confirmation
SELECT 'Données de test AgriSure ajoutées avec succès! 🎉' as message;
SELECT 'Vous avez maintenant:' as info;
SELECT '- 3 fermes avec différents types de sol' as fermes;
SELECT '- 7 événements climatiques historiques' as evenements;
SELECT '- 7 paiements automatiques via Hedera' as paiements;
SELECT '- 5 recommandations de cultures IA' as recommandations;
SELECT '- Données de capteurs Irwise en temps réel' as capteurs;
SELECT '- Prédictions de risques pour les 7 prochains jours' as predictions;
SELECT 'Rechargez votre application pour voir toutes les données!' as action;
