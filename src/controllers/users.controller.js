import { pool } from "../config/db.js";
import bcrypt from "bcryptjs";

// ✅ CREATE user
export const createUser = async (req, res) => {
  try {
    const { name, email, password, role = "ADMIN", status = "ACTIVE" } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email and password required" });
    }

    const hash = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
      "INSERT INTO platform_users (name, email, password_hash, role, status) VALUES (?,?,?,?,?)",
      [name, email, hash, role, status]
    );

    res.status(201).json({ message: "User created", id: result.insertId });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ message: "Error creating user" });
  }
};

// ✅ READ all users
export const getAllUsers = async (req, res) => {
  try {
    const [users] = await pool.query(
      "SELECT id, name, email, role, status, created_at FROM platform_users"
    );
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Error fetching users" });
  }
};

// ✅ READ single user by ID
export const getUserById = async (req, res) => {
  try {
    const [user] = await pool.query(
      "SELECT id, name, email, role, status, created_at FROM platform_users WHERE id=?",
      [req.params.id]
    );
    if (user.length === 0) return res.status(404).json({ message: "User not found" });
    res.json(user[0]);
  } catch (err) {
    res.status(500).json({ message: "Error fetching user" });
  }
};

// ✅ UPDATE user
export const updateUser = async (req, res) => {
  try {
    const { name, email, password, role, status } = req.body;

    const [[existing]] = await pool.query("SELECT * FROM platform_users WHERE id=?", [
      req.params.id,
    ]);
    if (!existing) return res.status(404).json({ message: "User not found" });

    let password_hash = existing.password_hash;
    if (password) {
      password_hash = await bcrypt.hash(password, 10);
    }

    await pool.query(
      "UPDATE platform_users SET name=?, email=?, password_hash=?, role=?, status=? WHERE id=?",
      [name || existing.name, email || existing.email, password_hash, role || existing.role, status || existing.status, req.params.id]
    );

    res.json({ message: "User updated" });
  } catch (err) {
    res.status(500).json({ message: "Error updating user" });
  }
};

// ✅ DELETE user
export const deleteUser = async (req, res) => {
  try {
    const [result] = await pool.query("DELETE FROM platform_users WHERE id=?", [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User deleted" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting user" });
  }
};

