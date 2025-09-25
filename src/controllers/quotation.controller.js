import { pool } from "../config/db.js";


// CREATE
export const createQuotation = async (req, res) => {
  const {
    company_id,
    customer_id,
    ref_no,
    manual_ref_no,
    quotation_no,
    manual_quo_no,
    quotation_date,
    valid_till,
    notes,
    terms_conditions,
    status,
    items
  } = req.body;

  const conn = await pool.getConnection();
  await conn.beginTransaction();

  try {
    // Insert into quotations
    const [result] = await conn.query(
      `INSERT INTO quotations
      (company_id, customer_id, ref_no, manual_ref_no, quotation_no, manual_quo_no,
       quotation_date, valid_till, notes, terms_conditions, status)
      VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
      [
        company_id,
        customer_id,
        ref_no,
        manual_ref_no,
        quotation_no,
        manual_quo_no,
        quotation_date,
        valid_till,
        notes,
        terms_conditions,
        status || "draft"
      ]
    );

    const quotationId = result.insertId;

    let subTotal = 0, taxTotal = 0, discountTotal = 0;

    // Insert items
    for (const item of items) {
      const { product_id, item_name, qty, rate, tax_percent, discount } = item;
      const amount = (qty * rate) - discount + ((qty * rate) * (tax_percent / 100));

      subTotal += qty * rate;
      discountTotal += discount;
      taxTotal += ((qty * rate) * (tax_percent / 100));

      await conn.query(
        `INSERT INTO quotation_items
        (quotation_id, product_id, item_name, qty, rate, tax_percent, discount, amount)
        VALUES (?,?,?,?,?,?,?,?)`,
        [quotationId, product_id, item_name, qty, rate, tax_percent, discount, amount]
      );
    }

    const grandTotal = subTotal - discountTotal + taxTotal;

    // Update totals
    await conn.query(
      `UPDATE quotations SET sub_total=?, tax_total=?, discount_total=?, grand_total=? WHERE id=?`,
      [subTotal, taxTotal, discountTotal, grandTotal, quotationId]
    );

    await conn.commit();
    conn.release();

    res.json({
      status: true,
      message: "Quotation created successfully",
      data: { id: quotationId, subTotal, taxTotal, discountTotal, grandTotal }
    });
  } catch (error) {
    await conn.rollback();
    conn.release();
    res.status(500).json({ status: false, message: error.message });
  }
};

// GET ALL
export const getAllQuotations = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT * FROM quotations ORDER BY created_at DESC`
    );
    res.json({ status: true, message: "Quotations fetched", data: rows });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
};

// GET BY ID
export const getQuotationById = async (req, res) => {
  try {
    const { id } = req.params;
    const [[quotation]] = await db.query(
      `SELECT * FROM quotations WHERE id=?`,
      [id]
    );
    if (!quotation) return res.status(404).json({ status: false, message: "Quotation not found" });

    const [items] = await db.query(
      `SELECT * FROM quotation_items WHERE quotation_id=?`,
      [id]
    );

    quotation.items = items;

    res.json({ status: true, message: "Quotation fetched", data: quotation });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
};

// UPDATE
export const updateQuotation = async (req, res) => {
  const { id } = req.params;
  const { items, ...fields } = req.body;

  const conn = await db.getConnection();
  await conn.beginTransaction();

  try {
    // Update main quotation fields
    await conn.query(
      `UPDATE quotations SET ? WHERE id=?`,
      [fields, id]
    );

    if (items && items.length > 0) {
      // Delete old items
      await conn.query(`DELETE FROM quotation_items WHERE quotation_id=?`, [id]);

      let subTotal = 0, taxTotal = 0, discountTotal = 0;
      for (const item of items) {
        const { product_id, item_name, qty, rate, tax_percent, discount } = item;
        const amount = (qty * rate) - discount + ((qty * rate) * (tax_percent / 100));

        subTotal += qty * rate;
        discountTotal += discount;
        taxTotal += ((qty * rate) * (tax_percent / 100));

        await conn.query(
          `INSERT INTO quotation_items
          (quotation_id, product_id, item_name, qty, rate, tax_percent, discount, amount)
          VALUES (?,?,?,?,?,?,?,?)`,
          [id, product_id, item_name, qty, rate, tax_percent, discount, amount]
        );
      }
      const grandTotal = subTotal - discountTotal + taxTotal;

      await conn.query(
        `UPDATE quotations SET sub_total=?, tax_total=?, discount_total=?, grand_total=? WHERE id=?`,
        [subTotal, taxTotal, discountTotal, grandTotal, id]
      );
    }

    await conn.commit();
    conn.release();

    res.json({ status: true, message: "Quotation updated successfully" });
  } catch (error) {
    await conn.rollback();
    conn.release();
    res.status(500).json({ status: false, message: error.message });
  }
};

// DELETE
export const deleteQuotation = async (req, res) => {
  const { id } = req.params;
  try {
    await db.query(`DELETE FROM quotation_items WHERE quotation_id=?`, [id]);
    await db.query(`DELETE FROM quotations WHERE id=?`, [id]);
    res.json({ status: true, message: "Quotation deleted successfully" });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
};
