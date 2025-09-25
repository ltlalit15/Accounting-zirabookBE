import { pool } from "../config/db.js";
import bcrypt from "bcryptjs";

// 1. Create User
export const createCompanyUser = async (req, res) => {
  try {
    const { company_id, name, email, password, role = "COMPANY_USERS", status = "Active" } = req.body;

    if (!company_id || !email || !password) {
      return res.status(400).json({ message: "company_id, email, and password are required" });
    }

    // hash password
    const password_hash = await bcrypt.hash(password, 10);

    await pool.query(
      `INSERT INTO company_users (company_id, name, email, password_hash, role, status) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [company_id, name, email, password_hash, role, status]
    );

    res.status(201).json({ message: "Company user created successfully" });
  } catch (error) {
    console.error("createCompanyUser error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// 2. Get All Users
export const getAllCompanyUsers = async (req, res) => {
  try {
    const [rows] = await pool.query(`SELECT id, company_id, name, email, role, status, created_at FROM company_users`);
    res.json(rows);
  } catch (error) {
    console.error("getAllCompanyUsers error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get all users of a specific company
export const getCompanyUsersByCompanyId = async (req, res) => {
  try {
    const { company_id } = req.params;

    if (!company_id) {
      return res.status(400).json({ message: "company_id is required" });
    }

    const [users] = await pool.query(
      "SELECT id, company_id, name, email, role, status, created_at FROM company_users WHERE company_id = ? ORDER BY id DESC",
      [company_id]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: "No users found for this company" });
    }

    res.status(200).json({ message: "Users fetched successfully", data: users });
  } catch (error) {
    console.error("getCompanyUsersByCompanyId error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


// 3. Get User by ID
export const getCompanyUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const [[user]] = await pool.query(
      `SELECT id, company_id, name, email, role, status, created_at 
       FROM company_users WHERE id = ?`,
      [id]
    );
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    console.error("getCompanyUserById error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// 4. Update User
export const updateCompanyUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, password, role, status } = req.body;

    let query = `UPDATE company_users SET `;
    const fields = [];
    const values = [];

    if (name) { fields.push("name = ?"); values.push(name); }
    if (email) { fields.push("email = ?"); values.push(email); }
    if (role) { fields.push("role = ?"); values.push(role); }
    if (status) { fields.push("status = ?"); values.push(status); }
    if (password) {
      const password_hash = await bcrypt.hash(password, 10);
      fields.push("password_hash = ?");
      values.push(password_hash);
    }

    if (fields.length === 0) return res.status(400).json({ message: "No fields to update" });

    query += fields.join(", ") + " WHERE id = ?";
    values.push(id);

    const [result] = await pool.query(query, values);
    if (result.affectedRows === 0) return res.status(404).json({ message: "User not found" });

    res.json({ message: "Company user updated successfully" });
  } catch (error) {
    console.error("updateCompanyUser error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// 5. Delete User
export const deleteCompanyUser = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query(`DELETE FROM company_users WHERE id = ?`, [id]);

    if (result.affectedRows === 0) return res.status(404).json({ message: "User not found" });

    res.json({ message: "Company user deleted successfully" });
  } catch (error) {
    console.error("deleteCompanyUser error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
