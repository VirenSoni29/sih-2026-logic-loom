import { query } from '../config/db.js';

class UserModel {
  // Create a new user
  static async create({ name, email, passwordHash, role = 'user' }) {
    const text = `
      INSERT INTO users (name, email, password_hash, role)
      VALUES ($1, $2, $3, $4)
      RETURNING id, name, email, role, created_at, updated_at;
    `;
    const values = [name, email.toLowerCase().trim(), passwordHash, role];
    const { rows } = await query(text, values);
    return rows[0];
  }

  // Find user by email (including password hash for authentication)
  static async findByEmail(email) {
    const text = `SELECT * FROM users WHERE email = $1;`;
    const { rows } = await query(text, [email.toLowerCase().trim()]);
    return rows[0] || null;
  }

  // Find user by ID (excluding password hash)
  static async findById(id) {
    const text = `
      SELECT id, name, email, role, created_at, updated_at 
      FROM users 
      WHERE id = $1;
    `;
    const { rows } = await query(text, [id]);
    return rows[0] || null;
  }

  // Update user profile
  static async updateProfile(id, { name }) {
    const text = `
      UPDATE users
      SET name = COALESCE($1, name), updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING id, name, email, role, created_at, updated_at;
    `;
    const { rows } = await query(text, [name, id]);
    return rows[0] || null;
  }

  // Update password
  static async updatePassword(id, passwordHash) {
    const text = `
      UPDATE users
      SET password_hash = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING id, name, email, role, created_at, updated_at;
    `;
    const { rows } = await query(text, [passwordHash, id]);
    return rows[0] || null;
  }

  // Get all users (admin only)
  static async findAll() {
    const text = `
      SELECT id, name, email, role, created_at, updated_at
      FROM users
      ORDER BY created_at DESC;
    `;
    const { rows } = await query(text);
    return rows;
  }
}

export default UserModel;
