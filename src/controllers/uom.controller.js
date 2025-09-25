import { pool } from "../config/db.js";

export const createUOM = async (req, res) => {
  try {
    const { company_id, unit_name } = req.body;
    await pool.query(
      `INSERT INTO uoms (company_id, unit_name) VALUES (?, ?)`,
      [company_id, unit_name]
    );
    res.status(201).json({ status: true, message: "UOM created successfully" });
  } catch (err) {
    res.status(500).json({ status: false, message: err.message });
  }
};


export const getAllUOMs = async (req, res) => {
  try {
    const [rows] = await pool.query(`SELECT * FROM uoms`);
    res.json({ status: true, message: "All reterived data", data: rows });
  } catch (err) {
    res.status(500).json({ status: false, message: err.message });
  }
};


