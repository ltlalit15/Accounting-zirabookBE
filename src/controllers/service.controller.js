import { pool } from "../config/db.js";

// ✅ Create Service
export const createService = async (req, res) => {
  try {
    const {
      company_id,
      service_name,
      sku,
      description,
      uom,
      price,
      tax_percent,
      allow_in_invoice,
      remarks
    } = req.body;

    await pool.query(
      `INSERT INTO services 
      (company_id, service_name, sku, description, uom, price, tax_percent, allow_in_invoice, remarks) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        company_id || null,
        service_name,
        sku || null,
        description || null,
        uom || null,
        price || 0,
        tax_percent || 0,
        allow_in_invoice !== undefined ? allow_in_invoice : 1,
        remarks || null
      ]
    );

    res.status(201).json({ status: true, message: "Service created successfully" });
  } catch (err) {
    res.status(500).json({ status: false, message: err.message });
  }
};

// ✅ Get All Services
export const getAllServices = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT s.*, c.name AS company_name
      FROM services s
      LEFT JOIN companies c ON s.company_id = c.id
      
    `);

    res.json({
      status: true,
      message: "All services fetched successfully",
      data: rows
    });
  } catch (err) {
    res.status(500).json({ status: false, message: err.message });
  }
};


// ✅ Get Service By ID
export const getServiceById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(`SELECT * FROM services WHERE id=?`, [id]);

    if (rows.length === 0) return res.status(404).json({ status: false, message: "Service not found" });

    res.json({ status: true, message: "Service fetched", data: rows[0] });
  } catch (err) {
    res.status(500).json({ status: false, message: err.message });
  }
};

// ✅ Get Services By Company
export const getServicesByCompanyId = async (req, res) => {
  try {
    const { company_id } = req.params;
    const [rows] = await pool.query(`SELECT * FROM services WHERE company_id=?`, [company_id]);
    res.json({ status: true, message: "Company services fetched", data: rows });
  } catch (err) {
    res.status(500).json({ status: false, message: err.message });
  }
};

// ✅ Update Service
export const updateService = async (req, res) => {
  try {
    const { id } = req.params;
    const fields = req.body;

    const updates = Object.keys(fields).map(key => `${key}=?`).join(", ");
    const values = Object.values(fields);

    const [result] = await pool.query(
      `UPDATE services SET ${updates} WHERE id=?`,
      [...values, id]
    );

    if (result.affectedRows === 0) return res.status(404).json({ status: false, message: "Service not found" });

    res.json({ status: true, message: "Service updated successfully" });
  } catch (err) {
    res.status(500).json({ status: false, message: err.message });
  }
};

// ✅ Delete Service
export const deleteService = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query(`DELETE FROM services WHERE id=?`, [id]);

    if (result.affectedRows === 0) return res.status(404).json({ status: false, message: "Service not found" });

    res.json({ status: true, message: "Service deleted successfully" });
  } catch (err) {
    res.status(500).json({ status: false, message: err.message });
  }
};