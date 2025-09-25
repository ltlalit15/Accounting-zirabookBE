import { pool } from "../config/db.js";


export const createTransaction = async (req, res) => {
  try {
    const {
      date,
      company_id,
      balance_type,
      voucher_type,
      voucher_no,
      amount,
      from_type,
      from_id,
      account_type,
      note
    } = req.body;

    // Auto Transaction ID
    const transaction_id = "TXN" + Date.now();

    await pool.query(
      `INSERT INTO transactions 
       (date, company_id, transaction_id, balance_type, voucher_type, voucher_no, amount, from_type, from_id, account_type, note) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        date,
        company_id || null,
        transaction_id,
        balance_type,
        voucher_type,
        voucher_no,
        amount,
        from_type,
        from_id,
        account_type,
        note || null
      ]
    );

    res.status(201).json({ status: true, message: "Transaction created successfully", transaction_id });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
};


export const getAllTransactions = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        t.*,
        comp.name AS company_name,
        c1.name_english AS from_customer_name,
        v1.name_english AS from_vendor_name,
        a1.account_name AS from_account_name
      FROM transactions t
      LEFT JOIN companies comp ON t.company_id = comp.id
      LEFT JOIN customers c1 ON t.from_type = 'Customer' AND t.from_id = c1.id
      LEFT JOIN vendors   v1 ON t.from_type = 'Vendor'   AND t.from_id = v1.id
      LEFT JOIN accounts  a1 ON t.from_type = 'Account'  AND t.from_id = a1.id
      
    `);

    const formattedRows = rows.map(txn => {
      let fromField = {};

      if (txn.from_customer_name) {
        fromField = { from_customer_name: txn.from_customer_name };
      } else if (txn.from_vendor_name) {
        fromField = { from_vendor_name: txn.from_vendor_name };
      } else if (txn.from_account_name) {
        fromField = { from_account_name: txn.from_account_name };
      }

      return {
        id: txn.id,
        transaction_id: txn.transaction_id,
        date: txn.date,
        voucher_type: txn.voucher_type,
        balance_type: txn.balance_type,
        voucher_no: txn.voucher_no,
        amount: txn.amount,
        account_type: txn.account_type,
        company_id: txn.company_id,
        company_name: txn.company_name,
        from_type: txn.from_type,
        from_id: txn.from_id,
        ...fromField, // ✅ only the matched field
        note: txn.note,
        created_at: txn.created_at,
      };
    });

    res.json({
      status: true,
      message: "Transactions fetched successfully",
      data: formattedRows,
    });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
};



export const getTransactionById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(`SELECT * FROM transactions WHERE id=?`, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ status: false, message: "Transaction not found" });
    }

    res.json({ status: true, message: "Transaction fetched successfully", data: rows[0] });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
};


export const getTransactionByCompany = async (req, res) => {
  try {
    const { company_id } = req.params;

    if (!company_id) {
      return res.status(400).json({
        status: false,
        message: "company_id is required",
      });
    }

    const [rows] = await pool.query(
      `SELECT * FROM transactions WHERE company_id = ?`,
      [company_id]
    );

    if (!rows.length) {
      return res.status(404).json({
        status: false,
        message: "No transactions found for this company",
      });
    }

    res.json({
      status: true,
      message: "Transactions fetched successfully",
      data: rows,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};


export const updateTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const fields = req.body;

    const updates = Object.keys(fields).map(key => `${key}=?`).join(", ");
    const values = Object.values(fields);

    const [result] = await pool.query(
      `UPDATE transactions SET ${updates} WHERE id=?`,
      [...values, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ status: false, message: "Transaction not found" });
    }

    res.json({ status: true, message: "Transaction updated successfully" });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
};


export const deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query(`DELETE FROM transactions WHERE id=?`, [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ status: false, message: "Transaction not found" });
    }

    res.json({ status: true, message: "Transaction deleted successfully" });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
};


