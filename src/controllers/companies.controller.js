import { pool } from "../config/db.js";
import bcrypt from "bcryptjs";



import cloudinary from "cloudinary";
import fs from "fs";

// ✅ Cloudinary Config
cloudinary.v2.config({
  cloud_name: "dkqcqrrbp",
  api_key: "418838712271323",
  api_secret: "p12EKWICdyHWx8LcihuWYqIruWQ",
});

export const createCompany = async (req, res) => {
  try {
    const { name, email, password, start_date, expire_date, plan_id ,	plan_type} = req.body;


    let logoUrl = null;

    // ✅ Upload logo if file is provided in form-data
    if (req.files && req.files.logo) {
      const file = req.files.logo;
      try {
        const uploadResult = await cloudinary.v2.uploader.upload(
          file.tempFilePath,
          {
            folder: "company_logos", // Cloudinary folder
          }
        );
        logoUrl = uploadResult.secure_url;
        fs.unlinkSync(file.tempFilePath); // delete temp file
      } catch (err) {
        console.error("Cloudinary Upload Error:", err);
        return res.status(500).json({ message: "Logo upload failed" });
      }
    }

    // ✅ Hash password
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    // ✅ Insert company into DB
    await pool.query(
      `INSERT INTO companies (name, email, password_hash, start_date, expire_date, plan_id, plan_type, logo_url)
       VALUES (?, ?, ?, ?, ?, ?, ?,?)`,
      [name, email, hash, start_date || null, expire_date || null, plan_id, plan_type, logoUrl]
    );

    return res.status(201).json({ message: "Company created successfully" });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ message: "Email already exists" });
    }
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};


export const getCompanies = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT c.id, c.name, c.email, c.start_date, c.expire_date, c.status, c.logo_url,c.plan_type, 
              p.id as plan_id, p.name as plan_name
       FROM companies c
       JOIN plans p ON p.id = c.plan_id
       ORDER BY c.id DESC`
    );
    if (rows.length === 0) return res.status(404).json({ message: "No companies found" });
    return res.status(200).json({ message: "Companies fetched successfully", data: rows });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

export const getCompanyModules = async (req, res) => {
  try {
    const { id } = req.params;

    const [[company]] = await pool.query("SELECT id, name, plan_id FROM companies WHERE id = ?", [id]);
    if (!company) return res.status(404).json({ message: "Company not found" });

    const [mods] = await pool.query(
      `SELECT m.id, m.\`key\`, m.label, pm.module_price
       FROM plan_modules pm
       JOIN modules m ON m.id = pm.module_id
       WHERE pm.plan_id = ?`,
      [company.plan_id]
    );

    if (mods.length === 0) return res.status(404).json({ message: "No modules mapped to this company's plan" });

    return res.status(200).json({
      message: "Company modules fetched successfully",
      data: {
        company_id: company.id,
        company_name: company.name,
        plan_id: company.plan_id,
        modules: mods
      }
    });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// export const updateCompanyPlan = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { plan_id } = req.body;
//     if (!plan_id) return res.status(400).json({ message: "plan_id is required" });

//     const [result] = await pool.query("UPDATE companies SET plan_id = ? WHERE id = ?", [plan_id, id]);
//     if (result.affectedRows === 0) return res.status(404).json({ message: "Company not found" });

//     return res.status(200).json({ message: "Company plan updated successfully" });
//   } catch (error) {
//     return res.status(500).json({ message: "Internal server error", error: error.message });
//   }
// };



// ✅ Update Company
export const updateCompanyPlan = async (req, res) => {
  try {
    const { id } = req.params; // URL se company id
    const {
      name,
      email,
      password,
      start_date,
      expire_date,
      plan_id,
      plan_type,
    } = req.body;

    let logoUrl = null;

    // ✅ Upload new logo if provided
    if (req.files && req.files.logo) {
      const file = req.files.logo;
      try {
        const uploadResult = await cloudinary.v2.uploader.upload(
          file.tempFilePath,
          { folder: "company_logos" }
        );
        logoUrl = uploadResult.secure_url;
        fs.unlinkSync(file.tempFilePath); // delete temp file
      } catch (err) {
        console.error("Cloudinary Upload Error:", err);
        return res.status(500).json({ message: "Logo upload failed" });
      }
    }

    // ✅ Hash password only if provided
    let hash = null;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      hash = await bcrypt.hash(password, salt);
    }

    // ✅ Build dynamic update query
    const fields = [];
    const values = [];

    if (name) {
      fields.push("name = ?");
      values.push(name);
    }
    if (email) {
      fields.push("email = ?");
      values.push(email);
    }
    if (hash) {
      fields.push("password_hash = ?");
      values.push(hash);
    }
    if (start_date) {
      fields.push("start_date = ?");
      values.push(start_date);
    }
    if (expire_date) {
      fields.push("expire_date = ?");
      values.push(expire_date);
    }
    if (plan_id) {
      fields.push("plan_id = ?");
      values.push(plan_id);
    }
    if (plan_type) {
      fields.push("plan_type = ?");
      values.push(plan_type);
    }
    if (logoUrl) {
      fields.push("logo_url = ?");
      values.push(logoUrl);
    }

    if (fields.length === 0) {
      return res.status(400).json({ message: "No fields to update" });
    }

    values.push(id);

    await pool.query(
      `UPDATE companies SET ${fields.join(", ")} WHERE id = ?`,
      values
    );

    return res.json({ message: "Company updated successfully" });
  } catch (error) {
    console.error("Update Error:", error);
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ message: "Email already exists" });
    }
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};



export const deleteCompany = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "Company ID is required" });
    }

    // Check if company exists
    const [[company]] = await pool.query("SELECT id FROM companies WHERE id = ?", [id]);
    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    // Delete company
    await pool.query("DELETE FROM companies WHERE id = ?", [id]);

    return res.status(200).json({ message: "Company deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

