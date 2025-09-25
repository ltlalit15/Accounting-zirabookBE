import { pool } from "../config/db.js";

export const createUnitDetail = async (req, res) => {
  try {
    const { company_id, uom_id, weight_per_unit } = req.body;
    await pool.query(
      `INSERT INTO unit_details (company_id, uom_id, weight_per_unit) VALUES (?, ?, ?)`,
      [company_id, uom_id, weight_per_unit]
    );
    res.status(201).json({ status: true, message: "Unit Detail created successfully" });
  } catch (err) {
    res.status(500).json({ status: false, message: err.message });
  }
};


export const getAllUnitDetails = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        ud.*,
        u.unit_name,
        c.name AS company_name
      FROM unit_details ud
      LEFT JOIN uoms u ON ud.uom_id = u.id
      LEFT JOIN companies c ON ud.company_id = c.id

    `);

    res.json({ 
      status: true, 
      message: "Unit Details fetched successfully",
      data: rows 
    });
  } catch (err) {
    res.status(500).json({ status: false, message: err.message });
  }
};


export const getUnitDetailById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(
      `SELECT * from unit_details
       WHERE id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ status: false, message: "Unit Detail not found" });
    }

    res.json({ status: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ status: false, message: err.message });
  }
};


export const getUnitDetailsByCompanyId = async (req, res) => {
  try {
    const { company_id } = req.params;
    const [rows] = await pool.query(
      `
      SELECT 
        ud.*,
        u.unit_name
      FROM unit_details ud
      LEFT JOIN uoms u ON ud.uom_id = u.id
      WHERE ud.company_id = ?
      `,
      [company_id]
    );

    
    res.json({ 
      status: true, 
      message: "Unit Details fetched successfully",
      data: rows 
    });
  } catch (err) {
    res.status(500).json({ status: false, message: err.message });
  }
};



export const updateUnitDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const { uom_id, weight_per_unit } = req.body;

    const [result] = await pool.query(
      `UPDATE unit_details SET uom_id = ?, weight_per_unit = ? WHERE id = ?`,
      [uom_id, weight_per_unit, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ status: false, message: "Unit Detail not found" });
    }

    res.json({ status: true, message: "Unit Detail updated successfully" });
  } catch (err) {
    res.status(500).json({ status: false, message: err.message });
  }
};


export const deleteUnitDetail = async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.query(
      `DELETE FROM unit_details WHERE id = ?`,
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ status: false, message: "Unit Detail not found" });
    }

    res.json({ status: true, message: "Unit Detail deleted successfully" });
  } catch (err) {
    res.status(500).json({ status: false, message: err.message });
  }
};



