-- ============================================================================
-- LandSafe: Seed Telemetry & Monitoring Station Data
-- ============================================================================

-- 1. Insert Core Monitored Himalayan Locations
INSERT INTO locations (name, district, state, latitude, longitude, risk_zone) VALUES
('Chamoli (Alaknanda Basin)', 'Chamoli', 'Uttarakhand', 30.4225, 79.3242, 'HIGH'),
('Joshimath (Helang Slope)', 'Chamoli', 'Uttarakhand', 30.5574, 79.5658, 'HIGH'),
('Rudraprayag (Kedarnath Highway)', 'Rudraprayag', 'Uttarakhand', 30.2858, 78.9817, 'HIGH'),
('Tehri Garhwal (New Tehri)', 'Tehri Garhwal', 'Uttarakhand', 30.3782, 78.4803, 'MODERATE'),
('Uttarkashi (Bhagirathi Valley)', 'Uttarkashi', 'Uttarakhand', 30.7268, 78.4354, 'MODERATE'),
('Pauri Garhwal', 'Pauri Garhwal', 'Uttarakhand', 30.1458, 78.7770, 'MODERATE'),
('Nainital (Balia Ravine)', 'Nainital', 'Uttarakhand', 29.3919, 79.4542, 'MODERATE'),
('Pithoragarh (Dharchula Zone)', 'Pithoragarh', 'Uttarakhand', 29.5829, 80.2182, 'HIGH'),
('Dehradun (Valley Area)', 'Dehradun', 'Uttarakhand', 30.3165, 78.0322, 'LOW'),
('Rishikesh Foothills', 'Dehradun', 'Uttarakhand', 30.0869, 78.2676, 'LOW')
ON CONFLICT DO NOTHING;

-- 2. Insert Terrain Geological Attributes
INSERT INTO terrain_data (location_id, elevation_m, slope_degree, aspect_degree, soil_type, land_cover) VALUES
(1, 1450, 42.0, 180, 'Weathered Schist', 'Sparse Alpine Scrub'),
(2, 1890, 46.0, 210, 'Highly weathered Colluvium', 'Moraine Gravel'),
(3, 890, 39.0, 160, 'Fissured Quartzite', 'Mixed Forest'),
(4, 1550, 31.0, 140, 'Weathered Phyllite', 'Pine Forest'),
(5, 1150, 36.0, 195, 'Loose Granitic Soil', 'Terraced Agriculture'),
(6, 1650, 27.0, 120, 'Stable Loam', 'Dense Oak Forest'),
(7, 2080, 33.0, 225, 'Weathered Shale', 'Slope Vegetation'),
(8, 1620, 41.0, 175, 'Highly weathered Schist', 'Sparse Grassland'),
(9, 640, 14.0, 90, 'Alluvial Silt', 'Urban / Valley'),
(10, 370, 18.0, 110, 'Riverine Gravel', 'Dense Vegetation')
ON CONFLICT DO NOTHING;

-- 3. Insert Recent Weather Telemetry
INSERT INTO weather_data (location_id, rainfall_mm, rainfall_duration_hours, temperature, humidity, wind_speed) VALUES
(1, 165.0, 12.5, 18.5, 88.0, 14.2),
(2, 178.0, 14.0, 16.2, 91.0, 18.5),
(3, 142.0, 10.0, 22.0, 84.0, 11.0),
(4, 95.0, 6.5, 24.5, 68.0, 9.5),
(5, 115.0, 8.0, 21.0, 74.0, 12.0),
(6, 78.0, 5.0, 20.5, 62.0, 8.0),
(7, 88.0, 6.0, 17.0, 65.0, 10.5),
(8, 150.0, 11.0, 19.0, 86.0, 15.0),
(9, 45.0, 3.0, 28.0, 48.0, 6.5),
(10, 52.0, 3.5, 29.0, 52.0, 7.0);

-- 4. Insert Historical Landslide Training Events
INSERT INTO historical_landslides (location_id, event_date, rainfall_mm, rainfall_duration_hours, slope_degree, elevation_m, landslide_occurred) VALUES
(1, '2023-08-14', 185.0, 16.0, 42.0, 1450.0, TRUE),
(2, '2023-07-22', 190.0, 18.0, 46.0, 1890.0, TRUE),
(3, '2022-09-02', 160.0, 12.0, 39.0, 890.0, TRUE),
(1, '2024-06-10', 40.0, 2.0, 42.0, 1450.0, FALSE),
(4, '2023-08-01', 95.0, 6.0, 31.0, 1550.0, FALSE);

-- 5. Insert Baseline ML Predictions
INSERT INTO predictions (location_id, risk_score, risk_level, model_name) VALUES
(1, 0.8200, 'HIGH', 'XGBoost'),
(2, 0.8900, 'HIGH', 'XGBoost'),
(3, 0.7600, 'HIGH', 'XGBoost'),
(4, 0.5400, 'MODERATE', 'XGBoost'),
(5, 0.6100, 'MODERATE', 'XGBoost'),
(8, 0.7900, 'HIGH', 'XGBoost');

-- 6. Insert Critical Alerts
INSERT INTO alerts (prediction_id, alert_level, message, status) VALUES
(1, 'HIGH', 'Heavy rainfall (165mm) and steep slope condition. Potential debris flow in Alaknanda basin.', 'PENDING'),
(2, 'HIGH', 'Active subsidence and high saturation in Helang Slope. Evacuation advisory active.', 'PENDING');
