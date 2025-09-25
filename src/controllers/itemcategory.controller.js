import { pool } from "../config/db.js";


export const createItemCategory = async (req, res) => {
  try {
    const { company_id, item_category_name } = req.body;
    await pool.query(
      `INSERT INTO item_category (company_id, item_category_name) VALUES (?, ?)`,
      [company_id, item_category_name]
    );
    res.status(201).json({ status: true, message: "Item category created successfully" });
  } catch (err) {
    res.status(500).json({ status: false, message: err.message });
  }
};


export const getAllCategoryItem = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        ic.id,
        ic.company_id,
        c.name AS company_name,
        ic.item_category_name,
        ic.created_at
      FROM item_category ic
      LEFT JOIN companies c ON ic.company_id = c.id
     
    `);

    res.json({
      status: true,
      message: "All item categories retrieved successfully",
      data: rows,
    });
  } catch (err) {
    res.status(500).json({ status: false, message: err.message });
  }
};


