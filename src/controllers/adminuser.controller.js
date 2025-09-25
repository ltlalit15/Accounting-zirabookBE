import { pool } from "../config/db.js";

import bcrypt from "bcryptjs";
import cloudinary from "cloudinary";

import jwt from "jsonwebtoken";

import fs from "fs";

cloudinary.config({
  cloud_name: 'dkqcqrrbp',
  api_key: '418838712271323',
  api_secret: 'p12EKWICdyHWx8LcihuWYqIruWQ'
});

export const createAdminUser = async (req, res) => {
  try {
    const { company_id, name, phone, email, role_id, status, password } = req.body;

   

    // 📸 Upload image (optional)
    let image = null;
    if (req.files && req.files.image) {
      try {
        const result = await cloudinary.uploader.upload(req.files.image.tempFilePath, {
          folder: "users",
        });
        image = result.secure_url;
      } catch (uploadErr) {
        console.error("Cloudinary upload failed:", uploadErr);
        return res.status(500).json({
          status: false,
          message: "Image upload failed",
          error: uploadErr.message,
        });
      }
    }

    // 🔑 Encrypt password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // 💾 Insert into DB
    const [result] = await pool.query(
      `INSERT INTO users 
       (company_id, name, phone, email, role_id, status, password, image)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        company_id || null,
        name,
        phone || null,
        email,
        role_id || null,
        status || "Active",
        password_hash,
        image,
      ]
    );

    res.status(201).json({
      status: true,
      message: "User created successfully"
     
    });
  } catch (error) {
    console.error("Create Admin User Error:", error);
    res.status(500).json({ status: false, message: error.message });
  }
};


export const getAllAdminUsers = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT u.*, c.name AS company_name, r.role_name
       FROM users u
       LEFT JOIN companies c ON u.company_id = c.id
       LEFT JOIN roles r ON u.role_id = r.id
       `
    );
    res.json({ status: true, message: "Users fetched successfully", data: rows });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
};



export const getAdminUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(
      `SELECT u.*, c.name AS company_name, r.role_name
       FROM users u
       LEFT JOIN companies c ON u.company_id = c.id
       LEFT JOIN roles r ON u.role_id = r.id
       WHERE u.id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ status: false, message: "User not found" });
    }

    res.json({ status: true, message: "User fetched successfully", data: rows[0] });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
};



export const updateAdminUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { company_id, name, phone, email, role_id, status, password } = req.body;

    // 📸 Upload image if provided
    let image = null;
    if (req.files && req.files.image) {
      try {
        const result = await cloudinary.uploader.upload(req.files.image.tempFilePath, {
          folder: "users",
        });
        image = result.secure_url;
      } catch (uploadErr) {
        console.error("Cloudinary upload failed:", uploadErr);
        return res.status(500).json({
          status: false,
          message: "Image upload failed",
          error: uploadErr.message,
        });
      }
    }

    // 🔑 Hash password if provided
    let password_hash = null;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      password_hash = await bcrypt.hash(password, salt);
    }

    // Update user in DB
    const [result] = await pool.query(
      `UPDATE users 
       SET 
         company_id = ?, 
         name = ?, 
         phone = ?, 
         email = ?, 
         role_id = ?, 
         status = ?, 
         password = IFNULL(?, password), 
         image = IFNULL(?, image)
       WHERE id = ?`,
      [
        company_id || null,
        name,
        phone || null,
        email,
        role_id || null,
        status || "Active",
        password_hash,
        image,
        id,
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ status: false, message: "User not found" });
    }

    res.json({ status: true, message: "User updated successfully" });
  } catch (error) {
    console.error("Update Admin User Error:", error);
    res.status(500).json({ status: false, message: error.message });
  }
};


export const deleteAdminUser = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query(`DELETE FROM users WHERE id = ?`, [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ status: false, message: "User not found" });
    }

    res.json({ status: true, message: "AdminUser deleted successfully" });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
};




// export const login = async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     if (!email || !password) {
//       return res.status(400).json({ message: "Email and password required" });
//     }

//     // User ढूँढो
//     const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);

//     if (!rows.length) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     const user = rows[0];

//     // ✅ Password compare करो (अब सही column से)
//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) {
//       return res.status(401).json({ message: "Invalid credentials" });
//     }

//     // ✅ JWT Token generate करो
//     const token = jwt.sign(
//       {
//         id: user.id,
//         role: user.role,
//         email: user.email,
//         name: user.name
//       },
//       process.env.JWT_SECRET,
//       { expiresIn: "7h" }
//     );

//     res.status(200).json({
//       message: "Login successful",
//       user: {
//         id: user.id,
//         name: user.name,
//         email: user.email,
//         role: user.role,
//         status: user.status
//       },
//       token
//     });
//   } catch (err) {
//     console.error("Error:", err);
//     res.status(500).json({ message: "Error logging in" });
//   }
// };



export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    let user = null;
    let role = null; // "superadmin" OR "company"

    // 1️⃣ Check in users (Super Admin / Staff)
    const [userRows] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
    if (userRows.length) {
      user = userRows[0];
      role = "superadmin";
    } else {
      // 2️⃣ Else check in companies
      const [companyRows] = await pool.query("SELECT * FROM companies WHERE email = ?", [email]);
      if (companyRows.length) {
        user = companyRows[0];
        role = "company";
      }
    }

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // ✅ Password compare
    let isMatch = false;
    if (role === "superadmin") {
      isMatch = await bcrypt.compare(password, user.password); // users table → password
    } else if (role === "company") {
      isMatch = await bcrypt.compare(password, user.password_hash); // companies table → password_hash
    }

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // ✅ JWT Token generate
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        name: user.name,
        role,
        ...(role === "company" && {
          company_id: user.id,
          plan_id: user.plan_id,
          plan_type: user.plan_type
        }),
        ...(role === "superadmin" && {
          company_id: user.company_id
        })
      },
      process.env.JWT_SECRET,
      { expiresIn: "7h" }
    );

    res.status(200).json({
      message: "Login successful",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role,
        ...(role === "company" && {
          plan_id: user.plan_id,
          plan_type: user.plan_type,
          status: user.status
        }),
        ...(role === "superadmin" && {
          status: user.status
        })
      },
      token
    });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ message: "Error logging in" });
  }
};
