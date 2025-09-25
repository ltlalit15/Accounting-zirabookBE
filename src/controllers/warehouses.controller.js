import { pool } from "../config/db.js";

 // CREATE Warehouse
export const createWarehouse = async (req, res) => {
  try {
    const { company_id, warehouse_name, location } = req.body;

    const [result] = await pool.query(
      `INSERT INTO warehouses (company_id, warehouse_name, location) VALUES (?, ?, ?)`,
      [company_id || null, warehouse_name, location || null]
    );

    res.status(201).json({
      status: true,
      message: "Warehouse created successfully",
      data: { id: result.insertId, company_id, warehouse_name, location },
    });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
};

// GET All Warehouses
export const getAllWarehouses = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT w.*, c.name AS company_name
      FROM warehouses w
      LEFT JOIN companies c ON w.company_id = c.id
      
    `);
    res.json({ status: true, message: "Warehouses fetched successfully", data: rows });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
};

// GET Warehouse By ID
export const getWarehouseById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(
      `SELECT w.*, c.name AS company_name
       FROM warehouses w
       LEFT JOIN companies c ON w.company_id = c.id
       WHERE w.id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ status: false, message: "Warehouse not found" });
    }

    res.json({ status: true, message: "Warehouse fetched successfully", data: rows[0] });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
};

// UPDATE Warehouse
export const updateWarehouse = async (req, res) => {
  try {
    const { id } = req.params;
    const { warehouse_name, location } = req.body;

    const [result] = await pool.query(
      `UPDATE warehouses SET warehouse_name = ?, location = ? WHERE id = ?`,
      [warehouse_name, location, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ status: false, message: "Warehouse not found" });
    }

    res.json({ status: true, message: "Warehouse updated successfully" });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
};


// DELETE Warehouse
export const deleteWarehouse = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query(`DELETE FROM warehouses WHERE id = ?`, [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ status: false, message: "Warehouse not found" });
    }

    res.json({ status: true, message: "Warehouse deleted successfully" });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
};
   