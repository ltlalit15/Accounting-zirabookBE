import { pool } from "../config/db.js";


export const createSubgroup = async (req, res) => {
  try {
    const { category_id, name } = req.body;

    await pool.query(
      `INSERT INTO subgroups (category_id, name) VALUES (?, ?)`,
      [category_id, name]
    );

    res.status(201).json({ status: true, message: "Subgroup created successfully" });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
};



export const getAllSubgroups = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT s.*, c.name AS category_name 
       FROM subgroups s
       LEFT JOIN categories c ON s.category_id = c.id
       `
    );
    res.json({ status: true, message: "Subgroups fetched successfully", data: rows });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
};



export const getSubgroupById = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.query(
      `SELECT s.*, c.name AS category_name 
       FROM subgroups s
       LEFT JOIN categories c ON s.category_id = c.id
       WHERE s.id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ status: false, message: "Subgroup not found" });
    }

    res.json({ status: true, message: "Subgroup fetched successfully", data: rows[0] });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
};



export const updateSubgroup = async (req, res) => {
  try {
    const { id } = req.params;
    const { category_id, name } = req.body;

    if (!category_id || !name) {
      return res.status(400).json({ status: false, message: "category_id and name are required" });
    }

    const [result] = await pool.query(
      `UPDATE subgroups SET category_id = ?, name = ? WHERE id = ?`,
      [category_id, name, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ status: false, message: "Subgroup not found" });
    }

    res.json({ status: true, message: "Subgroup updated successfully" });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
};



export const deleteSubgroup = async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.query(`DELETE FROM subgroups WHERE id = ?`, [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ status: false, message: "Subgroup not found" });
    }

    res.json({ status: true, message: "Subgroup deleted successfully" });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
};
