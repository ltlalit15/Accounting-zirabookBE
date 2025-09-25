import { pool } from "../config/db.js";

export const createCategory = async (req, res) => {
  try {
    const { name } = req.body;

    await pool.query(`INSERT INTO categories (name) VALUES (?)`, [name]);

    res.status(201).json({ status: "true", message: "category created successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const getAllCategories = async (req, res) => {
  try {
    const [rows] = await pool.query(`SELECT * FROM categories ORDER BY id DESC`);
    res.status(201).json({status: "true", message: "All Reterived Data", rows});
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};




export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Category name is required" });
    }

    const [result] = await pool.query(`UPDATE categories SET name = ? WHERE id = ?`, [name, id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.json({ status: "true", message: "Category updated successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.query(`DELETE FROM categories WHERE id = ?`, [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.json({ status: "true",message: "Category deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};






