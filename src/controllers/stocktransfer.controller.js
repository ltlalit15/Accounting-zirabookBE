import { pool } from "../config/db.js";


export const createTransfer = async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const {
      company_id,
      voucher_no,
      manual_voucher_no,
      transfer_date,
      destination_warehouse_id,
      notes,
      items
    } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ status: false, message: "No items provided" });
    }

    await conn.beginTransaction();

    // Insert into transfers
    const [transferResult] = await conn.query(
      `INSERT INTO transfers 
       (company_id, destination_warehouse_id, voucher_no, manual_voucher_no, transfer_date, notes)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [company_id, destination_warehouse_id, voucher_no, manual_voucher_no, transfer_date, notes]
    );

    const transferId = transferResult.insertId;

    for (const item of items) {
      const { product_id, source_warehouse_id, qty, rate, narration } = item;

      // Deduct stock from source warehouse
      await conn.query(
        `UPDATE products 
         SET initial_qty = initial_qty - ? 
         WHERE id = ? AND warehouse_id = ?`,
        [qty, product_id, source_warehouse_id]
      );

      // Add stock to destination warehouse
      const [existing] = await conn.query(
        `SELECT id FROM products WHERE id = ? AND warehouse_id = ?`,
        [product_id, destination_warehouse_id]
      );

      if (existing.length > 0) {
        await conn.query(
          `UPDATE products 
           SET initial_qty = initial_qty + ? 
           WHERE id = ? AND warehouse_id = ?`,
          [qty, product_id, destination_warehouse_id]
        );
      } else {
        await conn.query(
          `INSERT INTO products (company_id, warehouse_id, item_category_id, item_name, hsn, barcode, sku, description, initial_qty, min_order_qty, as_of_date, initial_cost, sale_price, purchase_price, discount, tax_account, remarks, image, created_at)
           SELECT company_id, ?, item_category_id, item_name, hsn, barcode, sku, description, ?, min_order_qty, as_of_date, initial_cost, sale_price, purchase_price, discount, tax_account, remarks, image, NOW()
           FROM products WHERE id = ?`,
          [destination_warehouse_id, qty, product_id]
        );
      }

      // Insert into transfer_items
      await conn.query(
        `INSERT INTO transfer_items (transfer_id, product_id, source_warehouse_id, qty, rate, narration)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [transferId, product_id, source_warehouse_id, qty, rate, narration]
      );
    }

    await conn.commit();

    res.status(201).json({
      status: true,
      message: "Transfer created successfully",
      transfer_id: transferId
    });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ status: false, message: err.message });
  } finally {
    conn.release();
  }
};


export const getAllTransfers = async (req, res) => {
  try {
    // 🔹 Fetch all transfers (header info)
    const [transferRows] = await pool.query(`
      SELECT 
        t.id,
        t.voucher_no,
        t.manual_voucher_no,
        t.transfer_date,
        t.notes,
        dw.warehouse_name AS destination_warehouse,
        dw.location AS destination_location
      FROM transfers t
      LEFT JOIN warehouses dw ON t.destination_warehouse_id = dw.id
      ORDER BY t.transfer_date DESC
    `);

    if (transferRows.length === 0) {
      return res.json({ status: true, message: "No transfers found", data: [] });
    }

    // 🔹 Get all transfer items in one query (for performance)
    const [itemRows] = await pool.query(`
      SELECT 
        ti.transfer_id,
        ti.id,
        ti.product_id,
        p.item_name,
        ti.qty,
        ti.rate,
        ti.narration,
         (ti.qty * ti.rate) AS amount,
        sw.warehouse_name AS source_warehouse,
        sw.location AS source_location
      FROM transfer_items ti
      LEFT JOIN products p ON ti.product_id = p.id
      LEFT JOIN warehouses sw ON ti.source_warehouse_id = sw.id
    `);

    // 🔹 Group items by transfer_id
  

    
  const transfersWithItems = transferRows.map(t => {
      const items = itemRows.filter(i => i.transfer_id === t.id);
      const total_amount = items.reduce((sum, i) => sum + Number(i.amount), 0);
      return { ...t, items, total_amount };
    });

    res.json({
      status: true,
      message: "Transfers fetched successfully",
      data: transfersWithItems
    });
  } catch (err) {
    res.status(500).json({ status: false, message: err.message });
  }
};


export const getTransfersByCompanyId = async (req, res) => {
  try {
    const { companyId } = req.params;

    // 🔹 Fetch transfers for given company
    const [transferRows] = await pool.query(
      `SELECT 
          t.id,
          t.voucher_no,
          t.manual_voucher_no,
          t.transfer_date,
          t.notes,
          dw.warehouse_name AS destination_warehouse,
          dw.location AS destination_location
       FROM transfers t
       LEFT JOIN warehouses dw ON t.destination_warehouse_id = dw.id
       WHERE t.company_id = ?
       ORDER BY t.transfer_date DESC`,
      [companyId]
    );

    if (transferRows.length === 0) {
      return res.json({
        status: true,
        message: "No transfers found for this company",
        data: []
      });
    }

    // 🔹 Fetch all items for those transfers
    const [itemRows] = await pool.query(
      `SELECT 
          ti.transfer_id,
          ti.id,
          ti.product_id,
          p.item_name,
          ti.qty,
          ti.rate,
          ti.narration,
          (ti.qty * ti.rate) AS amount,
          sw.warehouse_name AS source_warehouse,
          sw.location AS source_location
       FROM transfer_items ti
       LEFT JOIN products p ON ti.product_id = p.id
       LEFT JOIN warehouses sw ON ti.source_warehouse_id = sw.id
       WHERE ti.transfer_id IN (
         SELECT id FROM transfers WHERE company_id = ?
       )`,
      [companyId]
    );

    // 🔹 Group items per transfer + calculate totals
    const transfersWithItems = transferRows.map(t => {
      const items = itemRows
        .filter(i => i.transfer_id === t.id)
        .map(i => ({
          ...i,
          qty: Number(i.qty),
          rate: Number(i.rate),
          amount: Number(i.amount)
        }));

      const total_amount = items.reduce((sum, i) => sum + i.amount, 0);

      return { ...t, items, total_amount };
    });

    res.json({
      status: true,
      message: "Transfers fetched successfully",
      data: transfersWithItems
    });
  } catch (err) {
    res.status(500).json({ status: false, message: err.message });
  }
};