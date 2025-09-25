import { pool } from "../config/db.js";


// ✅ Create Role
export const createRole = async (req, res) => {
  try {
    const { role_name, role_type_id, general_permissions } = req.body;

    if (!role_name || !role_type_id) {
      return res.status(400).json({ status: false, message: "role_name and role_type_id are required" });
    }

    await pool.query(
      `INSERT INTO roles (role_name, role_type_id, general_permissions) VALUES (?, ?, ?)`,
      [role_name, role_type_id, JSON.stringify(general_permissions || [])]
    );

    res.status(201).json({ status: true, message: "Role created successfully" });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
};

// ✅ Get All Roles
// ✅ Get All Roles (parse general_permissions)
export const getAllRoles = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT r.*, rt.type_name 
       FROM roles r
       LEFT JOIN role_types rt ON r.role_type_id = rt.id`
    );

    const cleanedRows = rows.map((row) => {
      return {
        ...row,
        general_permissions: row.general_permissions
          ? JSON.parse(row.general_permissions)
          : [],
      };
    });

    res.json({
      status: true,
      message: "Roles fetched successfully",
      data: cleanedRows,
    });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
};

// ✅ Get Role By ID (parse general_permissions)
export const getRoleById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(
      `SELECT r.*, rt.type_name 
       FROM roles r
       LEFT JOIN role_types rt ON r.role_type_id = rt.id
       WHERE r.id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res
        .status(404)
        .json({ status: false, message: "Role not found" });
    }

    const role = rows[0];
    const cleanedRole = {
      ...role,
      general_permissions: role.general_permissions
        ? JSON.parse(role.general_permissions)
        : [],
    };

    res.json({
      status: true,
      message: "Role fetched successfully",
      data: cleanedRole,
    });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
};


// ✅ Update Role
export const updateRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role_name, role_type_id, general_permissions } = req.body;

    const [result] = await pool.query(
      `UPDATE roles 
       SET role_name=?, role_type_id=?, general_permissions=? 
       WHERE id=?`,
      [role_name, role_type_id, JSON.stringify(general_permissions || []), id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ status: false, message: "Role not found" });
    }

    res.json({ status: true, message: "Role updated successfully" });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
};


// ✅ Delete Role
export const deleteRole = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query(`DELETE FROM roles WHERE id=?`, [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ status: false, message: "Role not found" });
    }

    res.json({ status: true, message: "Role deleted successfully" });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
};