import { pool } from "../config/db.js";

import cloudinary from "cloudinary";
import fs from "fs";

cloudinary.v2.config({
  cloud_name: "dkqcqrrbp",
  api_key: "418838712271323",
  api_secret: "p12EKWICdyHWx8LcihuWYqIruWQ"
});

// CREATE Product
export const createProduct = async (req, res) => {
  try {
    const {
      company_id,
      warehouse_id,
      item_category_id,
      item_name,
      hsn,
      barcode,
      sku,
      description,
      initial_qty,
      min_order_qty,
      as_of_date,
      initial_cost,
      sale_price,
      purchase_price,
      discount,
      tax_account,
      remarks
    } = req.body;

    let imageUrls = [];

    // ✅ Multiple images upload to Cloudinary
    if (req.files && req.files.image) {
      const files = Array.isArray(req.files.image) ? req.files.image : [req.files.image];

      for (const file of files) {
        const uploadResult = await cloudinary.v2.uploader.upload(file.tempFilePath, {
          folder: "products"
        });
        imageUrls.push(uploadResult.secure_url);

        // 🧹 delete temp file
        fs.unlinkSync(file.tempFilePath);
      }
    }

    // ✅ Insert product
    const [result] = await pool.query(
      `INSERT INTO products 
      (company_id, warehouse_id, item_category_id, item_name, hsn, barcode, sku, description, 
      initial_qty, min_order_qty, as_of_date, initial_cost, sale_price, purchase_price, 
      discount, tax_account, remarks, image) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        company_id,
        warehouse_id,
        item_category_id,
        item_name,
        hsn || null,
        barcode || null,
        sku || null,
        description || null,
        initial_qty || 0,
        min_order_qty || 0,
        as_of_date || null,
        initial_cost || 0,
        sale_price || 0,
        purchase_price || 0,
        discount || 0,
        tax_account || null,
        remarks || null,
        imageUrls.join(",") // ✅ multiple images stored as comma-separated
      ]
    );

    res.status(201).json({
      status: true,
      message: "Product created successfully"
    
    });
  } catch (err) {
    console.error("Create Product Error:", err);
    res.status(500).json({ status: false, message: err.message });
  }
};



export const getAllProducts = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        p.id,
        p.company_id,
        c.name AS company_name,
        p.warehouse_id,
        w.warehouse_name,
        p.item_category_id,
        ic.item_category_name,
        p.item_name,
        p.hsn,
        p.barcode,
        p.sku,
        p.description,
        p.initial_qty,
        p.min_order_qty,
        p.as_of_date,
        p.initial_cost,
        p.sale_price,
        p.purchase_price,
        p.discount,
        p.tax_account,
        p.remarks,
        p.image,
        p.created_at
      FROM products p
      LEFT JOIN companies c ON p.company_id = c.id
      LEFT JOIN item_category ic ON p.item_category_id = ic.id
      LEFT JOIN warehouses w ON p.warehouse_id = w.id
     
    `);

    // format images as array
    const formatted = rows.map(p => {
      const { image, ...rest } = p;
      return {
        ...rest,
        image: image ? image.split(",") : []
      };
    });

    res.json({
      status: true,
      message: "All products fetched successfully",
      data: formatted
    });
  } catch (err) {
    res.status(500).json({ status: false, message: err.message });
  }
};


export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(`SELECT * FROM products WHERE id = ?`, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ status: false, message: "Product not found" });
    }

    const { image, ...rest } = rows[0];
    const product = {
      ...rest,
      image: image ? image.split(",") : []
    };

    res.json({
      status: true,
      message: "Product fetched successfully",
      data: product
    });
  } catch (err) {
    res.status(500).json({ status: false, message: err.message });
  }
};


export const getProductsByCompanyId = async (req, res) => {
  try {
    const { company_id } = req.params;
    const [rows] = await pool.query(`SELECT * FROM products WHERE company_id = ?`, [company_id]);

    const formatted = rows.map(p => {
      const { image, ...rest } = p;
      return {
        ...rest,
        image: image ? image.split(",") : []
      };
    });

    res.json({
      status: true,
      message: "Products fetched successfully by company",
      data: formatted
    });
  } catch (err) {
    res.status(500).json({ status: false, message: err.message });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const fields = req.body;

    let imageUrls = [];

    // ✅ if new images uploaded, upload to Cloudinary
    if (req.files && req.files.image) {
      const files = Array.isArray(req.files.image) ? req.files.image : [req.files.image];

      for (const file of files) {
        const uploadResult = await cloudinary.v2.uploader.upload(file.tempFilePath, {
          folder: "products"
        });
        imageUrls.push(uploadResult.secure_url);
        fs.unlinkSync(file.tempFilePath);
      }
      fields.image = imageUrls.join(",");
    }

    const updates = Object.keys(fields).map(key => `${key}=?`).join(", ");
    const values = Object.values(fields);

    const [result] = await pool.query(
      `UPDATE products SET ${updates} WHERE id = ?`,
      [...values, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ status: false, message: "Product not found" });
    }

    res.json({ status: true, message: "Product updated successfully" });
  } catch (err) {
    res.status(500).json({ status: false, message: err.message });
  }
};


export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.query(`DELETE FROM products WHERE id = ?`, [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ status: false, message: "Product not found" });
    }

    res.json({ status: true, message: "Product deleted successfully" });
  } catch (err) {
    res.status(500).json({ status: false, message: err.message });
  }
};
