import { pool } from "../config/db.js";

export const createAccount = async (req, res) => {
  try {
    const { company_id, subgroup_id, account_name, has_bank_details, account_number, ifsc_code, bank_name_branch } = req.body;

    await pool.query(
      `INSERT INTO accounts (company_id, subgroup_id, account_name, has_bank_details, account_number, ifsc_code, bank_name_branch)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        company_id || null,
        subgroup_id,
        account_name,
        has_bank_details || 0,
        account_number || null,
        ifsc_code || null,
        bank_name_branch || null
      ]
    );

    res.status(201).json({ status: true, message: "Account created successfully" });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
};




export const getAllAccounts = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT 
          a.*, 
          s.name AS subgroup_name,
          c.name AS company_name
       FROM accounts a 
       LEFT JOIN subgroups s ON a.subgroup_id = s.id
       LEFT JOIN companies c ON a.company_id = c.id`
    );

    res.json({
      status: true,
      message: "Accounts fetched successfully",
      data: rows
    });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
};


export const getAccountById = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.query(
      `SELECT a.*, s.name AS subgroup_name 
       FROM accounts a
       LEFT JOIN subgroups s ON a.subgroup_id = s.id
       WHERE a.id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ status: false, message: "Account not found" });
    }

    res.json({ status: true, message: "Account fetched successfully", data: rows[0] });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
};



// export const getAccountByCompany = async (req, res) => {
//   try {
//     const { company_id } = req.params;

//     if (!company_id) {
//       return res.status(400).json({
//         status: false,
//         message: "company_id is required",
//       });
//     }

//     const [rows] = await pool.query(
//       `SELECT * FROM accounts WHERE company_id = ?`,
//       [company_id]
//     );

//     if (!rows.length) {
//       return res.status(404).json({
//         status: false,
//         message: "No accounts found for this company",
//       });
//     }

//     res.json({
//       status: true,
//       message: "Accounts fetched successfully",
//       data: rows,
//     });
//   } catch (error) {
//     res.status(500).json({
//       status: false,
//       message: error.message,
//     });
//   }
// };



export const getAccountByCompany = async (req, res) => {
  try {
    const { company_id } = req.params;

    if (!company_id) {
      return res.status(400).json({
        status: false,
        message: "company_id is required",
      });
    }

    // ✅ JOIN with subgroups table if subgroup_id exists
    const [rows] = await pool.query(
      `
      SELECT 
        a.*, 
        s.name AS subgroup_name
      FROM accounts a
      LEFT JOIN subgroups s ON a.subgroup_id = s.id
      WHERE a.company_id = ?
      `,
      [company_id]
    );

    if (!rows.length) {
      return res.status(404).json({
        status: false,
        message: "No accounts found for this company",
      });
    }

    res.json({
      status: true,
      message: "Accounts fetched successfully",
      data: rows,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};


export const updateAccount = async (req, res) => {
  try {
    const { id } = req.params;
    const { subgroup_id, account_name, has_bank_details, account_number, ifsc_code, bank_name_branch, company_id } = req.body;

    const [result] = await pool.query(
      `UPDATE accounts 
       SET subgroup_id = ?, 
           account_name = ?, 
           has_bank_details = ?, 
           account_number = ?, 
           ifsc_code = ?, 
           bank_name_branch = ?, 
           company_id = ?
       WHERE id = ?`,
      [
        subgroup_id,
        account_name,
        has_bank_details || 0,
        account_number || null,
        ifsc_code || null,
        bank_name_branch || null,
        company_id || null, // ✅ company_id handled with or without
        id
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ status: false, message: "Account not found" });
    }

    res.json({ status: true, message: "Account updated successfully" });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
};



export const deleteAccount = async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.query(`DELETE FROM accounts WHERE id = ?`, [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ status: false, message: "Account not found" });
    }

    res.json({ status: true, message: "Account deleted successfully" });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
};

