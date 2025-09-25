import { pool } from "../config/db.js";


// ✅ Create Permission
export const createPermission = async (req, res) => {
  try {
    const { role_id, module_name, can_create, can_view, can_update, can_delete, full_access } = req.body;


    await pool.query(
      `INSERT INTO role_module_permissions 
       (role_id, module_name, can_create, can_view, can_update, can_delete, full_access) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        role_id,
        module_name,
        can_create || "0",
        can_view || "0",
        can_update || "0",
        can_delete || "0",
        full_access || "0",
      ]
    );

    res.status(201).json({ status: true, message: "Permission created successfully" });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
};

// ✅ Get All Permissions
export const getAllPermissions = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT p.*, r.role_name 
       FROM role_module_permissions p
       LEFT JOIN roles r ON p.role_id = r.id
       `
    );
    res.json({ status: true, message: "Permissions fetched successfully", data: rows });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
};

// ✅ Get Permission by ID
export const getPermissionById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(
      `SELECT p.*, r.role_name 
       FROM role_module_permissions p
       LEFT JOIN roles r ON p.role_id = r.id
       WHERE p.id=?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ status: false, message: "Permission not found" });
    }

    res.json({ status: true, message: "Permission fetched successfully", data: rows[0] });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
};

// ✅ Update Permission
export const updatePermission = async (req, res) => {
  try {
    const { id } = req.params;
    const { role_id, module_name, can_create, can_view, can_update, can_delete, full_access } = req.body;

    const [result] = await pool.query(
      `UPDATE role_module_permissions 
       SET role_id=?, module_name=?, can_create=?, can_view=?, can_update=?, can_delete=?, full_access=? 
       WHERE id=?`,
      [
        role_id,
        module_name,
        can_create || "0",
        can_view || "0",
        can_update || "0",
        can_delete || "0",
        full_access || "0",
        id,
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ status: false, message: "Permission not found" });
    }

    res.json({ status: true, message: "Permission updated successfully" });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
};

// ✅ Delete Permission
export const deletePermission = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query(`DELETE FROM role_module_permissions WHERE id=?`, [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ status: false, message: "Permission not found" });
    }

    res.json({ status: true, message: "Permission deleted successfully" });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
};
