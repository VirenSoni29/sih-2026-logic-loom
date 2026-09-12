import { query } from '../config/db.js';

class PredictionModel {
  // Record a new prediction log
  static async create({ userId, modelName, inputFeatures, predictionResult, explanationResult = null }) {
    try {
      const text = `
        INSERT INTO prediction_logs (user_id, model_name, input_features, prediction_result, explanation_result)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *;
      `;
      const values = [
        userId || null,
        modelName,
        JSON.stringify(inputFeatures),
        JSON.stringify(predictionResult),
        explanationResult ? JSON.stringify(explanationResult) : null
      ];
      const { rows } = await query(text, values);
      return rows[0];
    } catch (err) {
      console.warn('⚠️ Could not log prediction to database:', err.message);
      return null;
    }
  }

  // Get prediction history for a specific user
  static async findByUserId(userId, limit = 50) {
    try {
      const text = `
        SELECT * FROM prediction_logs
        WHERE user_id = $1
        ORDER BY created_at DESC
        LIMIT $2;
      `;
      const { rows } = await query(text, [userId, limit]);
      return rows;
    } catch (err) {
      console.warn('⚠️ Could not fetch prediction history:', err.message);
      return [];
    }
  }
}

export default PredictionModel;
