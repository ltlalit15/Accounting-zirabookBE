import { pool } from "../config/db.js";

export const createAdjustment = async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const { company_id, voucher_no, manual_voucher_no, adjustment_type, adjustment_date, notes, items } = req.body;

    await conn.beginTransaction();

    // Insert into adjustments
    const [adjustmentResult] = await conn.query(
      `INSERT INTO adjustments (company_id, voucher_no, manual_voucher_no, adjustment_type, adjustment_date, notes)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [company_id, voucher_no, manual_voucher_no, adjustment_type, adjustment_date, notes]
    );
    const adjustmentId = adjustmentResult.insertId;

    // Loop items
    for (const item of items) {
      const { product_id, warehouse_id, quantity, rate, narration } = item;

      // Insert adjustment item
      await conn.query(
        `INSERT INTO adjustment_items (adjustment_id, product_id, warehouse_id, quantity, rate, narration)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [adjustmentId, product_id, warehouse_id, quantity, rate, narration]
      );

      // Fetch current stock
      const [[product]] = await conn.query(
        `SELECT initial_qty, purchase_price FROM products WHERE id = ? AND warehouse_id = ?`,
        [product_id, warehouse_id]
      );

      if (!product) throw new Error(`Product ${product_id} not found in warehouse ${warehouse_id}`);

      // Apply adjustment
      if (adjustment_type === "add") {
        await conn.query(
          `UPDATE products SET initial_qty = initial_qty + ? WHERE id = ? AND warehouse_id = ?`,
          [quantity, product_id, warehouse_id]
        );
      } else if (adjustment_type === "remove") {
        if (product.initial_qty < quantity) {
          throw new Error(`Not enough stock for product ${product_id} in warehouse ${warehouse_id}`);
        }
        await conn.query(
          `UPDATE products SET initial_qty = initial_qty - ? WHERE id = ? AND warehouse_id = ?`,
          [quantity, product_id, warehouse_id]
        );
      } else if (adjustment_type === "adjust") {
        await conn.query(
          `UPDATE products SET purchase_price = ?, sale_price = ? WHERE id = ? AND warehouse_id = ?`,
          [rate, rate * 1.2, product_id, warehouse_id] // 👈 example: adjust both cost & sale
        );
      }
    }

    await conn.commit();

    res.status(201).json({ status: true, message: "Adjustment created successfully" });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ status: false, message: err.message });
  } finally {
    conn.release();
  }
};



export const getAllAdjustments = async (req, res) => {
  try {
    const [adjustmentRows] = await pool.query(
      `SELECT 
        a.id,
        a.company_id,
        a.voucher_no,
        a.manual_voucher_no,
        a.adjustment_type,
        a.adjustment_date,
        a.notes
      FROM adjustments a
     `
    );

    if (adjustmentRows.length === 0) {
      return res.status(404).json({ status: false, message: "Adjustment not found" });
    }

    const adjustment = adjustmentRows[0];

    // Get adjustment items
    const [itemRows] = await pool.query(
      `SELECT 
        ai.id,
        ai.adjustment_id,
        ai.product_id,
        p.item_name,
        ai.warehouse_id,
        w.warehouse_name,
        ai.quantity,
        ai.rate,
        ai.narration,
        (ai.quantity * ai.rate) AS amount
      FROM adjustment_items ai
      LEFT JOIN products p ON ai.product_id = p.id
      LEFT JOIN warehouses w ON ai.warehouse_id = w.id
     `
    );

    // Calculate total value
    const total_value = itemRows.reduce((sum, row) => sum + Number(row.amount), 0);

    res.json({
      status: true,
      message: "Adjustment fetched successfully",
      data: {
        ...adjustment,
        items: itemRows,
        total_value
      }
    });
  } catch (err) {
    res.status(500).json({ status: false, message: err.message });
  }
};


export const getAdjustmentById = async (req, res) => {
  try {
    const { id } = req.params;

    // Get adjustment header
    const [adjustmentRows] = await pool.query(
      `SELECT 
        a.id,
        a.company_id,
        a.voucher_no,
        a.manual_voucher_no,
        a.adjustment_type,
        a.adjustment_date,
        a.notes
      FROM adjustments a
      WHERE a.id = ?`,
      [id]
    );

    if (adjustmentRows.length === 0) {
      return res.status(404).json({ status: false, message: "Adjustment not found" });
    }

    const adjustment = adjustmentRows[0];

    // Get adjustment items
    const [itemRows] = await pool.query(
      `SELECT 
        ai.id,
        ai.adjustment_id,
        ai.product_id,
        p.item_name,
        ai.warehouse_id,
        w.warehouse_name,
        ai.quantity,
        ai.rate,
        ai.narration,
        (ai.quantity * ai.rate) AS amount
      FROM adjustment_items ai
      LEFT JOIN products p ON ai.product_id = p.id
      LEFT JOIN warehouses w ON ai.warehouse_id = w.id
      WHERE ai.adjustment_id = ?`,
      [id]
    );

    // Calculate total value
    const total_value = itemRows.reduce((sum, row) => sum + Number(row.amount), 0);

    res.json({
      status: true,
      message: "Adjustment fetched successfully",
      data: {
        ...adjustment,
        items: itemRows,
        total_value
      }
    });
  } catch (err) {
    res.status(500).json({ status: false, message: err.message });
  }
};


export const getAdjustmentsByCompanyId = async (req, res) => {
  try {
    const { companyId } = req.params;

    const [rows] = await pool.query(
      `SELECT 
        a.id AS adjustment_id,
        a.company_id,
        a.voucher_no,
        a.manual_voucher_no,
        a.adjustment_type,
        a.adjustment_date,
        a.notes,
        ai.id AS item_id,
        ai.product_id,
        p.item_name,
        ai.warehouse_id,
        w.warehouse_name,
        ai.quantity,
        ai.rate,
        ai.narration,
        (ai.quantity * ai.rate) AS amount
      FROM adjustments a
      LEFT JOIN adjustment_items ai ON a.id = ai.adjustment_id
      LEFT JOIN products p ON ai.product_id = p.id
      LEFT JOIN warehouses w ON ai.warehouse_id = w.id
      WHERE a.company_id = ?
      ORDER BY a.adjustment_date DESC, a.id DESC`,
      [companyId]
    );

    // Group adjustments with their items
    const adjustmentsMap = {};

    rows.forEach(row => {
      if (!adjustmentsMap[row.adjustment_id]) {
        adjustmentsMap[row.adjustment_id] = {
          id: row.adjustment_id,
          company_id: row.company_id,
          voucher_no: row.voucher_no,
          manual_voucher_no: row.manual_voucher_no,
          adjustment_type: row.adjustment_type,
          adjustment_date: row.adjustment_date,
          notes: row.notes,
          items: [],
          total_value: 0
        };
      }

      if (row.item_id) {
        const item = {
          id: row.item_id,
          product_id: row.product_id,
          item_name: row.item_name,
          warehouse_id: row.warehouse_id,
          warehouse_name: row.warehouse_name,
          quantity: row.quantity,
          rate: row.rate,
          narration: row.narration,
          amount: row.amount
        };

        adjustmentsMap[row.adjustment_id].items.push(item);
        adjustmentsMap[row.adjustment_id].total_value += Number(row.amount);
      }
    });

    const adjustments = Object.values(adjustmentsMap);

    res.json({
      status: true,
      message: "Adjustments fetched successfully",
      data: adjustments
    });
  } catch (err) {
    res.status(500).json({ status: false, message: err.message });
  }
};
/**
 * Update an adjustment
 */
export const updateAdjustment = async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const { id } = req.params;
    const { voucher_no, manual_voucher_no, adjustment_type, adjustment_date, notes, items } = req.body;

    await conn.beginTransaction();

    // Update header
    await conn.query(
      `UPDATE adjustments 
       SET voucher_no = ?, manual_voucher_no = ?, adjustment_type = ?, adjustment_date = ?, notes = ? 
       WHERE id = ?`,
      [voucher_no, manual_voucher_no, adjustment_type, adjustment_date, notes, id]
    );

    // Delete old items
    await conn.query(`DELETE FROM adjustment_items WHERE adjustment_id = ?`, [id]);

    // Re-insert new items
    for (const item of items) {
      const { product_id, warehouse_id, quantity, rate, narration } = item;
      await conn.query(
        `INSERT INTO adjustment_items (adjustment_id, product_id, warehouse_id, quantity, rate, narration)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [id, product_id, warehouse_id, quantity, rate, narration]
      );

      // ⚠️ Optionally: reapply stock changes here if you want stock to update on edit
    }

    await conn.commit();

    res.json({ status: true, message: "Adjustment updated successfully" });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ status: false, message: err.message });
  } finally {
    conn.release();
  }
};

/**
 * Delete an adjustment
 */
export const deleteAdjustment = async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const { id } = req.params;

    await conn.beginTransaction();

    await conn.query(`DELETE FROM adjustment_items WHERE adjustment_id = ?`, [id]);
    const [result] = await conn.query(`DELETE FROM adjustments WHERE id = ?`, [id]);

    await conn.commit();

    if (result.affectedRows === 0) {
      return res.status(404).json({ status: false, message: "Adjustment not found" });
    }

    res.json({ status: true, message: "Adjustment deleted successfully" });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ status: false, message: err.message });
  } finally {
    conn.release();
  }
};