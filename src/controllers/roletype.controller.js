import { pool } from "../config/db.js";

// ✅ Create Role Type
export const createRoleType = async (req, res) => {
  try {
    const { type_name } = req.body;
    if (!type_name) {
      return res.status(400).json({ status: false, message: "type_name is required" });
    }

    await pool.query(`INSERT INTO role_types (type_name) VALUES (?)`, [type_name]);

    res.status(201).json({ status: true, message: "Role Type created successfully" });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
};

// ✅ Get All Role Types
export const getAllRoleTypes = async (req, res) => {
  try {
    const [rows] = await pool.query(`SELECT * FROM role_types`);
    res.json({ status: true, message: "Role Types fetched successfully", data: rows });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
};

// ✅ Update Role Type
export const updateRoleType = async (req, res) => {
  try {
    const { id } = req.params;
    const { type_name } = req.body;

    if (!type_name) {
      return res.status(400).json({ status: false, message: "type_name is required" });
    }

    const [result] = await pool.query(`UPDATE role_types SET type_name=? WHERE id=?`, [
      type_name,
      id,
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ status: false, message: "Role Type not found" });
    }

    res.json({ status: true, message: "Role Type updated successfully" });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
};

// ✅ Delete Role Type
export const deleteRoleType = async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.query(`DELETE FROM role_types WHERE id=?`, [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ status: false, message: "Role Type not found" });
    }

    res.json({ status: true, message: "Role Type deleted successfully" });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
};