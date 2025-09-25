import { pool } from "../config/db.js";

import cloudinary from "cloudinary";

import fs from "fs";

cloudinary.config({
  cloud_name: 'dkqcqrrbp',
  api_key: '418838712271323',
  api_secret: 'p12EKWICdyHWx8LcihuWYqIruWQ'
});


// CREATE Customer
export const createCustomer = async (req, res) => {
  try {
    const {
      company_id,
      name_english,
      name_arabic,
      company_name,
      google_location,
      account_type,
      balance_type,
      account_name,
      account_balance,
      creation_date,
      bank_account_number,
      bank_ifsc,
      bank_name_branch,
      country,
      state,
      pincode,
      address,
      state_code,
      shipping_address,
      phone,
      email,
      credit_period,
      gstin,
      enable_gst
    } = req.body;

    let id_card_image = null;
    let image = null;

    if (req.files && req.files.id_card_image) {
      const result = await cloudinary.uploader.upload(req.files.id_card_image.tempFilePath, {
        folder: "customers"
      });
      id_card_image = result.secure_url;
    }

    if (req.files && req.files.image) {
      const result = await cloudinary.uploader.upload(req.files.image.tempFilePath, {
        folder: "customers"
      });
      image = result.secure_url;
    }

    await pool.query(
      `INSERT INTO customers 
       (company_id, name_english, name_arabic, company_name, google_location, id_card_image, image,
        account_type, balance_type, account_name, account_balance, creation_date,
        bank_account_number, bank_ifsc, bank_name_branch, country, state, pincode, address,
        state_code, shipping_address, phone, email, credit_period, gstin, enable_gst)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        company_id || null,
        name_english,
        name_arabic || null,
        company_name || null,
        google_location || null,
        id_card_image,
        image,
        account_type || "Sundry Debtors",
        balance_type || "Debit",
        account_name || null,
        account_balance || 0.0,
        creation_date || null,
        bank_account_number || null,
        bank_ifsc || null,
        bank_name_branch || null,
        country || null,
        state || null,
        pincode || null,
        address || null,
        state_code || null,
        shipping_address || null,
        phone || null,
        email || null,
        credit_period || 0,
        gstin || null,
        enable_gst || 0
      ]
    );

    res.status(201).json({ status: true, message: "Customer created successfully" });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
};

// GET All Customers
export const getAllCustomers = async (req, res) => {
  try {
    const [rows] = await pool.query(`SELECT * FROM customers`);
    res.json({ status: true, message: "Customers fetched successfully", data: rows });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
};

// GET Customer By ID
export const getCustomerById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(`SELECT * FROM customers WHERE id = ?`, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ status: false, message: "Customer not found" });
    }

    res.json({ status: true, message: "Customer fetched successfully", data: rows[0] });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
};

// UPDATE Customer
export const updateCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const fields = req.body;

    if (req.files && req.files.id_card_image) {
      const result = await cloudinary.uploader.upload(req.files.id_card_image.tempFilePath, {
        folder: "customers"
      });
      fields.id_card_image = result.secure_url;
    }

    if (req.files && req.files.image) {
      const result = await cloudinary.uploader.upload(req.files.image.tempFilePath, {
        folder: "customers"
      });
      fields.image = result.secure_url;
    }

    const updates = Object.keys(fields).map(key => `${key}=?`).join(", ");
    const values = Object.values(fields);

    const [resultUpdate] = await pool.query(
      `UPDATE customers SET ${updates} WHERE id=?`,
      [...values, id]
    );

    if (resultUpdate.affectedRows === 0) {
      return res.status(404).json({ status: false, message: "Customer not found" });
    }

    res.json({ status: true, message: "Customer updated successfully" });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
};

// DELETE Customer
export const deleteCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query(`DELETE FROM customers WHERE id = ?`, [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ status: false, message: "Customer not found" });
    }

    res.json({ status: true, message: "Customer deleted successfully" });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
};



export const getCustomersByCompany = async (req, res) => {
  try {
    const { company_id } = req.params;

    if (!company_id) {
      return res.status(400).json({
        status: false,
        message: "company_id is required",
      });
    }

    const [rows] = await pool.query(
      `SELECT * FROM customers WHERE company_id = ?`,
      [company_id]
    );

    if (!rows.length) {
      return res.status(404).json({
        status: false,
        message: "No customers found for this company",
      });
    }

    res.json({
      status: true,
      message: "Customers fetched successfully",
      data: rows,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};