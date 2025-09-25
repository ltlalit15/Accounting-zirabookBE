import { pool } from "../config/db.js";
import cloudinary from "cloudinary";

// configure cloudinary
cloudinary.config({
  cloud_name: "dkqcqrrbp",
  api_key: "418838712271323",
  api_secret: "p12EKWICdyHWx8LcihuWYqIruWQ",
});

export const createSalesQuotation = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const {
      company_id,
      customer_id,
      ref_no,
      manual_ref_no,
      quotation_no,
      manual_quo_no,
      quotation_date,
      valid_till,
      sub_total,
      tax_total,
      discount_total,
      grand_total,
      notes,
      terms_conditions,
      items, // array of items from frontend
    } = req.body;

    // ---- FILE UPLOAD HANDLING ----
    let signature = null;
    let photo = null;
    let attachments = [];

    if (req.files) {
      // signature
      if (req.files.signature) {
        const result = await cloudinary.uploader.upload(
          req.files.signature.tempFilePath,
          { folder: "quotations/signatures" }
        );
        signature = result.secure_url;
      }

      // photo
      if (req.files.photo) {
        const result = await cloudinary.uploader.upload(
          req.files.photo.tempFilePath,
          { folder: "quotations/photos" }
        );
        photo = result.secure_url;
      }

      // multiple attachments
      if (req.files.attachments) {
        const attachFiles = Array.isArray(req.files.attachments)
          ? req.files.attachments
          : [req.files.attachments];

        for (const file of attachFiles) {
          const result = await cloudinary.uploader.upload(file.tempFilePath, {
            folder: "quotations/attachments",
          });
          attachments.push(result.secure_url);
        }
      }
    }

    await connection.beginTransaction();

    // ---- INSERT INTO salesquotation ----
    const [quotationResult] = await connection.query(
      `INSERT INTO salesquotation 
       (company_id, customer_id, ref_no, manual_ref_no, quotation_no, manual_quo_no, quotation_date, valid_till, sub_total, tax_total, discount_total, grand_total, notes, terms_conditions, status, signature, photo, attachments) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        company_id,
        customer_id,
        ref_no,
        manual_ref_no,
        quotation_no,
        manual_quo_no,
        quotation_date,
        valid_till,
        sub_total,
        tax_total,
        discount_total,
        grand_total,
        notes,
        terms_conditions,
        "Draft", // default status
        signature,
        photo,
        JSON.stringify(attachments),
      ]
    );

    const quotationId = quotationResult.insertId;

    // ---- INSERT ITEMS ----
    if (items && items.length > 0) {
      const parsedItems = Array.isArray(items)
        ? items
        : JSON.parse(items); // handle stringified JSON

      const values = parsedItems.map((i) => [
        quotationId,
        i.product_id,
        i.item_name,
        i.qty,
        i.rate,
        i.tax,
        i.discount,
        i.amount,
      ]);

      await connection.query(
        `INSERT INTO salesquotation_items 
         (quotation_id, product_id, item_name, qty, rate, tax, discount, amount) VALUES ?`,
        [values]
      );
    }

    await connection.commit();

    res.status(201).json({
      status: true,
      message: "Sales Quotation created successfully",
      quotationId,
    });
  } catch (error) {
    await connection.rollback();
    console.error("Create SalesQuotation Error:", error);
    res.status(500).json({ status: false, message: error.message });
  } finally {
    connection.release();
  }
};


export const getSalesQuotationsByCompanyId = async (req, res) => {
  try {
    const { companyId } = req.params;

    // Fetch quotations with customer info
    const [quotations] = await pool.query(
      `SELECT sq.*, 
              c.name_english AS customer_name,
              c.company_name AS customer_company,
              c.phone AS customer_phone,
              c.email AS customer_email
       FROM salesquotation sq
       LEFT JOIN customers c ON sq.customer_id = c.id
       WHERE sq.company_id = ?
       ORDER BY sq.created_at DESC`,
      [companyId]
    );

    if (quotations.length === 0) {
      return res.json({ status: true, data: [] });
    }

    // Collect quotation IDs
    const quotationIds = quotations.map((q) => q.id);

    // Fetch all items for these quotations
    const [items] = await pool.query(
      `SELECT * FROM salesquotation_items WHERE quotation_id IN (?)`,
      [quotationIds]
    );

    // Attach items to each quotation
    const quotationMap = {};
    quotations.forEach((q) => {
      quotationMap[q.id] = { ...q, items: [] };
    });

    items.forEach((item) => {
      if (quotationMap[item.quotation_id]) {
        quotationMap[item.quotation_id].items.push(item);
      }
    });

    const result = Object.values(quotationMap);

    res.json({
      status: true,
      data: result,
    });
  } catch (error) {
    console.error("Get Quotations Error:", error);
    res.status(500).json({ status: false, message: error.message });
  }
};
/**
 * ✅ GET SINGLE QUOTATION BY ID (with items)
 */
export const getSalesQuotationById = async (req, res) => {
  try {
    const { id } = req.params;

    // quotation + customer details
    const [rows] = await pool.query(
      `SELECT sq.*, 
              c.name_english AS customer_name,
              c.company_name AS customer_company,
              c.phone AS customer_phone,
              c.email AS customer_email
       FROM salesquotation sq
       LEFT JOIN customers c ON sq.customer_id = c.id
       WHERE sq.id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ status: false, message: "Quotation not found" });
    }

    const quotation = rows[0];

    // fetch items
    const [items] = await pool.query(
      `SELECT * FROM salesquotation_items WHERE quotation_id = ?`,
      [id]
    );

    quotation.items = items;

    res.json({
      status: true,
      data: quotation,
    });
  } catch (error) {
    console.error("Get Quotation By ID Error:", error);
    res.status(500).json({ status: false, message: error.message });
  }
};