import pkg from 'pg';
const { Pool } = pkg;
import config from './config.js';

let pool;

if (config.DATABASE_URL) {
  pool = new Pool({
    connectionString: config.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });
} else {
  pool = new Pool({
    host: config.PGHOST || 'localhost',
    port: config.PGPORT || 5432,
    database: config.PGDATABASE || 'landsafe',
    user: config.PGUSER || 'postgres',
    password: config.PGPASSWORD || 'postgres',
  });
}

// Check database connection and initialize LandSafe schema tables
export const initDB = async () => {
  try {
    const client = await pool.connect();
    console.log('📦 Connected to PostgreSQL database successfully (LandSafe)');

    // 1. Locations Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS locations (
        location_id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        district VARCHAR(100),
        state VARCHAR(100),
        latitude DECIMAL(9,6),
        longitude DECIMAL(9,6),
        risk_zone VARCHAR(20) DEFAULT 'LOW',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 2. Weather Data Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS weather_data (
        weather_id SERIAL PRIMARY KEY,
        location_id INT NOT NULL REFERENCES locations(location_id) ON DELETE CASCADE,
        rainfall_mm DECIMAL(10,2) DEFAULT 0,
        rainfall_duration_hours DECIMAL(10,2) DEFAULT 0,
        temperature DECIMAL(5,2),
        humidity DECIMAL(5,2),
        wind_speed DECIMAL(6,2),
        recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 3. Terrain Data Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS terrain_data (
        terrain_id SERIAL PRIMARY KEY,
        location_id INT NOT NULL REFERENCES locations(location_id) ON DELETE CASCADE,
        elevation_m DECIMAL(10,2),
        slope_degree DECIMAL(6,2),
        aspect_degree DECIMAL(6,2),
        soil_type VARCHAR(100),
        land_cover VARCHAR(100)
      );
    `);

    // 4. Historical Landslides Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS historical_landslides (
        event_id SERIAL PRIMARY KEY,
        location_id INT NOT NULL REFERENCES locations(location_id) ON DELETE CASCADE,
        event_date DATE NOT NULL,
        rainfall_mm DECIMAL(10,2),
        rainfall_duration_hours DECIMAL(10,2),
        slope_degree DECIMAL(6,2),
        elevation_m DECIMAL(10,2),
        landslide_occurred BOOLEAN NOT NULL DEFAULT TRUE
      );
    `);

    // 5. Predictions Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS predictions (
        prediction_id SERIAL PRIMARY KEY,
        location_id INT NOT NULL REFERENCES locations(location_id) ON DELETE CASCADE,
        risk_score DECIMAL(5,4) NOT NULL,
        risk_level VARCHAR(20) NOT NULL,
        model_name VARCHAR(50) DEFAULT 'XGBoost',
        predicted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 6. Alerts Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS alerts (
        alert_id SERIAL PRIMARY KEY,
        prediction_id INT NOT NULL REFERENCES predictions(prediction_id) ON DELETE CASCADE,
        alert_level VARCHAR(20) NOT NULL,
        message TEXT NOT NULL,
        status VARCHAR(20) DEFAULT 'PENDING',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 7. Users Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        phone VARCHAR(20),
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'user',
        location_id INT REFERENCES locations(location_id) ON DELETE SET NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 8. Alert Recipients Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS alert_recipients (
        recipient_id SERIAL PRIMARY KEY,
        alert_id INT NOT NULL REFERENCES alerts(alert_id) ON DELETE CASCADE,
        user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        channel VARCHAR(20) DEFAULT 'APP',
        delivery_status VARCHAR(20) DEFAULT 'PENDING',
        sent_at TIMESTAMP WITH TIME ZONE
      );
    `);

    // 9. Prediction Logs (for tracking user-submitted interactive calculations)
    await client.query(`
      CREATE TABLE IF NOT EXISTS prediction_logs (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        model_name VARCHAR(100) NOT NULL,
        input_features JSONB NOT NULL,
        prediction_result JSONB NOT NULL,
        explanation_result JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 10. Performance Indexes
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_weather_location ON weather_data(location_id);
      CREATE INDEX IF NOT EXISTS idx_weather_recorded ON weather_data(recorded_at);
      CREATE INDEX IF NOT EXISTS idx_predictions_location ON predictions(location_id);
      CREATE INDEX IF NOT EXISTS idx_predictions_time ON predictions(predicted_at);
      CREATE INDEX IF NOT EXISTS idx_alerts_status ON alerts(status);
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_locations_risk ON locations(risk_zone);
    `);

    client.release();
    console.log('✅ LandSafe schema initialized successfully (locations, weather, terrain, historical, predictions, alerts, users, alert_recipients)');
  } catch (error) {
    console.warn('⚠️ Database connection notice:', error.message);
  }
};

export const query = (text, params) => pool.query(text, params);

export default pool;
