import { pool } from "../config/db.js";

export const createModule = async (req, res) => {
  try {
    const { key, label } = req.body;
    if (!key || !label) return res.status(400).json({ message: "key and label are required" });

    await pool.query("INSERT INTO modules (`key`, label) VALUES (?, ?)", [key, label]);
    return res.status(201).json({ message: "Module created successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

export const getAllModules = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT id, `key`, label FROM modules ORDER BY id");
    if (rows.length > 0) {
      return res.status(200).json({ message: "Modules fetched successfully", data: rows });
    } else {
      return res.status(404).json({ message: "No modules found" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};


export const deleteModule = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "Module ID is required" });
    }

    // Check if module exists
    const [[module]] = await pool.query("SELECT id FROM modules WHERE id = ?", [id]);
    if (!module) {
      return res.status(404).json({ message: "Module not found" });
    }

    // Delete module
    await pool.query("DELETE FROM modules WHERE id = ?", [id]);

    return res.status(200).json({ message: "Module deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};
