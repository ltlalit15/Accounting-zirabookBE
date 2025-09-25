import { pool } from "../config/db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const companyLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "email and password are required" });

    const [[company]] = await pool.query(
      "SELECT id, name, email, password_hash, plan_id, status FROM companies WHERE email = ?",
      [email]
    );
    if (!company) return res.status(404).json({ message: "Company not found" });

    const ok = await bcrypt.compare(password, company.password_hash);
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });

    if (company.status !== "Active") return res.status(403).json({ message: "Company not active" });

    const token = jwt.sign(
      { company_id: company.id, plan_id: company.plan_id, name: company.name, email: company.email },
      process.env.JWT_SECRET,
      { expiresIn: "12h" }
    );

    return res.status(200).json({ message: "Login successful",
      data: {
        id: company.id,
        name: company.name,
        email: company.email,
        plan_id: company.plan_id,
        status: company.status,
      },
       token
     });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};


export const myModules = async (req, res) => {
  try {
    const { company_id, plan_id } = req.user; // set in middleware
    const [mods] = await pool.query(
      `SELECT m.id, m.\`key\`, m.label, pm.module_price
       FROM plan_modules pm
       JOIN modules m ON m.id = pm.module_id
       WHERE pm.plan_id = ?`,
      [plan_id]
    );

    if (mods.length === 0) return res.status(404).json({ message: "No modules mapped to your plan" });

    return res.status(200).json({
      message: "Modules fetched successfully",
      data: { company_id, plan_id, modules: mods }
    });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};
