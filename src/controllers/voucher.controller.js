import { pool } from "../config/db.js";
import cloudinary from "cloudinary";
import fs from "fs";

// Cloudinary Config
cloudinary.v2.config({
  cloud_name: "dkqcqrrbp",
  api_key: "418838712271323",
  api_secret: "p12EKWICdyHWx8LcihuWYqIruWQ",
});

// ================== CREATE ==================
export const createVoucher = async (req, res) => {
  try {
    const {
      company_id,
      voucher_type,
      receipt_number,
      voucher_number,
      date,
      from_type,
      from_id,
      notes,
      product_details, // JSON string from form-data
    } = req.body;

    let logo_url = null;
    let signature_url = null;
    let photo_urls = [];
    let document_urls = [];

    // ✅ Logo Upload
    if (req.files && req.files.logo) {
      const upload = await cloudinary.v2.uploader.upload(req.files.logo.tempFilePath, {
        folder: "vouchers/logo",
      });
      logo_url = upload.secure_url;
      fs.unlinkSync(req.files.logo.tempFilePath);
    }

    // ✅ Signature Upload
    if (req.files && req.files.signature) {
      const upload = await cloudinary.v2.uploader.upload(req.files.signature.tempFilePath, {
        folder: "vouchers/signature",
      });
      signature_url = upload.secure_url;
      fs.unlinkSync(req.files.signature.tempFilePath);
    }

    // ✅ Multiple Photos Upload
    if (req.files && req.files.photos) {
      const files = Array.isArray(req.files.photos) ? req.files.photos : [req.files.photos];
      for (const file of files) {
        const upload = await cloudinary.v2.uploader.upload(file.tempFilePath, {
          folder: "vouchers/photos",
        });
        photo_urls.push(upload.secure_url);
        fs.unlinkSync(file.tempFilePath);
      }
    }

    // ✅ Multiple Documents Upload
    if (req.files && req.files.documents) {
      const files = Array.isArray(req.files.documents) ? req.files.documents : [req.files.documents];
      for (const file of files) {
        const upload = await cloudinary.v2.uploader.upload(file.tempFilePath, {
          folder: "vouchers/docs",
        });
        document_urls.push(upload.secure_url);
        fs.unlinkSync(file.tempFilePath);
      }
    }

    const [result] = await pool.query(
      `INSERT INTO vouchers 
       (company_id, voucher_type, receipt_number, voucher_number, date, from_type, from_id,
        notes, logo_url, signature_url, photo_urls, document_urls, product_details) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        company_id,
        voucher_type,
        receipt_number || null,
        voucher_number || null,
        date || null,
        from_type || null,
        from_id || null,
        notes || null,
        logo_url,
        signature_url,
        photo_urls.join(","),
        document_urls.join(","),
        product_details || "[]",
      ]
    );

    res.status(201).json({
      status: true,
      message: "Voucher created successfully"
      
    });
  } catch (err) {
    res.status(500).json({ status: false, message: err.message });
  }
};

export const getAllVouchers = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        v.*,
        CASE 
          WHEN v.from_type = 'Customer' THEN c.name_english
          WHEN v.from_type = 'Vendor' THEN ven.name_english
          ELSE NULL
        END AS from_name
      FROM vouchers v
      LEFT JOIN customers c ON v.from_id = c.id AND v.from_type = 'Customer'
      LEFT JOIN vendors ven ON v.from_id = ven.id AND v.from_type = 'Vendor'
      ORDER BY v.id DESC
    `);

    const formatted = rows.map(v => ({
      ...v,
      logo_url: v.logo_url || null,
      signature_url: v.signature_url || null,
      photo_urls: v.photo_urls
        ? v.photo_urls.split(",").filter(url => url.trim() !== "")
        : [],
      document_urls: v.document_urls
        ? v.document_urls.split(",").filter(url => url.trim() !== "")
        : [],
      product_details: v.product_details
        ? JSON.parse(v.product_details)
        : [],
    }));

    res.status(200).json({ status: true, data: formatted });
  } catch (err) {
    res.status(500).json({ status: false, message: err.message });
  }
};


// ================== GET BY ID ==================
export const getVoucherById = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.query(
      `
      SELECT 
        v.*,
        CASE 
          WHEN v.from_type = 'Customer' THEN c.name_english
          WHEN v.from_type = 'Vendor' THEN ven.name_english
          ELSE NULL
        END AS from_name
      FROM vouchers v
      LEFT JOIN customers c ON v.from_id = c.id AND v.from_type = 'Customer'
      LEFT JOIN vendors ven ON v.from_id = ven.id AND v.from_type = 'Vendor'
      WHERE v.id = ?
      `,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ status: false, message: "Voucher not found" });
    }

    const v = rows[0];

    const voucher = {
      ...v,
      logo_url: v.logo_url || null,
      signature_url: v.signature_url || null,
      photo_urls: v.photo_urls
        ? v.photo_urls.split(",").filter(url => url.trim() !== "")
        : [],
      document_urls: v.document_urls
        ? v.document_urls.split(",").filter(url => url.trim() !== "")
        : [],
      product_details: v.product_details
        ? JSON.parse(v.product_details)
        : [],
    };

    res.status(200).json({ status: true, data: voucher });
  } catch (err) {
    res.status(500).json({ status: false, message: err.message });
  }
};





export const getVouchersByCompanyId = async (req, res) => {
  try {
    const { company_id } = req.params;

    const [rows] = await pool.query(
      `
      SELECT 
        v.*,
        comp.name AS company_name,
        CASE 
          WHEN v.from_type = 'Customer' THEN c.name_english
          WHEN v.from_type = 'Vendor' THEN ven.name_english
          ELSE NULL
        END AS from_name
      FROM vouchers v
      LEFT JOIN companies comp ON v.company_id = comp.id
      LEFT JOIN customers c ON v.from_id = c.id AND v.from_type = 'Customer'
      LEFT JOIN vendors ven ON v.from_id = ven.id AND v.from_type = 'Vendor'
      WHERE v.company_id = ?
      ORDER BY v.id DESC
      `,
      [company_id]
    );

    const formatted = rows.map(v => ({
      ...v,
      company_name: v.company_name || null,
      logo_url: v.logo_url || null,
      signature_url: v.signature_url || null,
      photo_urls: v.photo_urls
        ? v.photo_urls.split(",").filter(url => url.trim() !== "")
        : [],
      document_urls: v.document_urls
        ? v.document_urls.split(",").filter(url => url.trim() !== "")
        : [],
      product_details: v.product_details
        ? JSON.parse(v.product_details)
        : [],
    }));

    res.status(200).json({ status: true, data: formatted });
  } catch (err) {
    res.status(500).json({ status: false, message: err.message });
  }
};



export const updateVoucher = async (req, res) => {
  try {
    const { id } = req.params; // voucher id
    const {
      company_id,
      voucher_type,
      receipt_number,
      voucher_number,
      date,
      from_type,
      from_id,
      notes,
      product_details, // JSON string
    } = req.body;

    let logo_url = null;
    let signature_url = null;
    let photo_urls = [];
    let document_urls = [];

    // ✅ Logo Upload (agar naya aaya to update karega)
    if (req.files && req.files.logo) {
      const upload = await cloudinary.v2.uploader.upload(req.files.logo.tempFilePath, {
        folder: "vouchers/logo",
      });
      logo_url = upload.secure_url;
      fs.unlinkSync(req.files.logo.tempFilePath);
    }

    // ✅ Signature Upload
    if (req.files && req.files.signature) {
      const upload = await cloudinary.v2.uploader.upload(req.files.signature.tempFilePath, {
        folder: "vouchers/signature",
      });
      signature_url = upload.secure_url;
      fs.unlinkSync(req.files.signature.tempFilePath);
    }

    // ✅ Multiple Photos Upload
    if (req.files && req.files.photos) {
      const files = Array.isArray(req.files.photos) ? req.files.photos : [req.files.photos];
      for (const file of files) {
        const upload = await cloudinary.v2.uploader.upload(file.tempFilePath, {
          folder: "vouchers/photos",
        });
        photo_urls.push(upload.secure_url);
        fs.unlinkSync(file.tempFilePath);
      }
    }

    // ✅ Multiple Documents Upload
    if (req.files && req.files.documents) {
      const files = Array.isArray(req.files.documents) ? req.files.documents : [req.files.documents];
      for (const file of files) {
        const upload = await cloudinary.v2.uploader.upload(file.tempFilePath, {
          folder: "vouchers/docs",
        });
        document_urls.push(upload.secure_url);
        fs.unlinkSync(file.tempFilePath);
      }
    }

    // ✅ Pahle ka voucher fetch karo (purane urls preserve karne ke liye)
    const [rows] = await pool.query(`SELECT * FROM vouchers WHERE id = ?`, [id]);
    if (!rows.length) {
      return res.status(404).json({ status: false, message: "Voucher not found" });
    }
    const oldVoucher = rows[0];

    // ✅ Update query
    await pool.query(
      `UPDATE vouchers SET 
        company_id = ?, 
        voucher_type = ?, 
        receipt_number = ?, 
        voucher_number = ?, 
        date = ?, 
        from_type = ?, 
        from_id = ?, 
        notes = ?, 
        logo_url = ?, 
        signature_url = ?, 
        photo_urls = ?, 
        document_urls = ?, 
        product_details = ?
      WHERE id = ?`,
      [
        company_id || oldVoucher.company_id,
        voucher_type || oldVoucher.voucher_type,
        receipt_number || oldVoucher.receipt_number,
        voucher_number || oldVoucher.voucher_number,
        date || oldVoucher.date,
        from_type || oldVoucher.from_type,
        from_id || oldVoucher.from_id,
        notes || oldVoucher.notes,
        logo_url || oldVoucher.logo_url,
        signature_url || oldVoucher.signature_url,
        photo_urls.length ? photo_urls.join(",") : oldVoucher.photo_urls,
        document_urls.length ? document_urls.join(",") : oldVoucher.document_urls,
        product_details || oldVoucher.product_details,
        id,
      ]
    );

    res.status(200).json({
      status: true,
      message: "Voucher updated successfully",
    });
  } catch (err) {
    res.status(500).json({ status: false, message: err.message });
  }
};


export const deleteVoucher = async (req, res) => {
  try {
    const { id } = req.params;

    // ✅ Pehle voucher check karo
    const [rows] = await pool.query(`SELECT * FROM vouchers WHERE id = ?`, [id]);
    if (!rows.length) {
      return res.status(404).json({ status: false, message: "Voucher not found" });
    }

    // ✅ Voucher delete karo
    await pool.query(`DELETE FROM vouchers WHERE id = ?`, [id]);

    res.status(200).json({
      status: true,
      message: "Voucher deleted successfully",
    });
  } catch (err) {
    res.status(500).json({ status: false, message: err.message });
  }
};

