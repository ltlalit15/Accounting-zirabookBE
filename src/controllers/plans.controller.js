import { pool } from "../config/db.js";

export const createPlan = async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const {
      name,
      base_price = 0,
      currency = "USD",
      invoice_limit = 0,
      additional_invoice_price = 0,
      user_limit = 1,
      storage_capacity_gb = 5,
      billing_cycle = "Monthly",
      status = "Active",
      description = "",
      modules = []
    } = req.body;



    if (!name) {
      conn.release();
      return res.status(400).json({ message: "Plan name is required" });
    }

    await conn.beginTransaction();

    const [planRes] = await conn.query(
      `INSERT INTO plans 
       (name, base_price, currency, invoice_limit, additional_invoice_price, user_limit, storage_capacity_gb, billing_cycle, status, description)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, base_price, currency, invoice_limit, additional_invoice_price, user_limit, storage_capacity_gb, billing_cycle, status, description]
    );

    const planId = planRes.insertId;

    if (Array.isArray(modules) && modules.length > 0) {
      const values = modules.map(m => [planId, m.module_id, m.module_price || 0]);
      await conn.query("INSERT INTO plan_modules (plan_id, module_id, module_price) VALUES ?", [values]);
    }

    await conn.commit();
    conn.release();
    return res.status(201).json({ message: "Plan created successfully", data: { id: planId } });
  } catch (error) {
    await conn.rollback();
    conn.release();
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};



export const getPlans = async (req, res) => {
  try {
    // 1. Fetch plans with subscriber count
    const [plans] = await pool.query(`
      SELECT p.*, COUNT(c.id) AS subscribers
      FROM plans p
      LEFT JOIN companies c ON p.id = c.plan_id
      GROUP BY p.id
      ORDER BY p.id DESC
    `);

    if (plans.length === 0) {
      return res.status(404).json({ message: "No plans found" });
    }

    // 2. Get all plan_modules + modules for these plans
    const planIds = plans.map(p => p.id);
    const [planModules] = await pool.query(
      `
      SELECT pm.plan_id, pm.module_id, pm.module_price, m.key, m.label
      FROM plan_modules pm
      INNER JOIN modules m ON pm.module_id = m.id
      WHERE pm.plan_id IN (?)
      `,
      [planIds]
    );

    // 3. Attach modules to plans
    const plansWithModules = plans.map(plan => {
      const modules = planModules
        .filter(pm => pm.plan_id === plan.id)
        .map(pm => ({
          id: pm.module_id,
          key: pm.key,
          label: pm.label,
          price: pm.module_price
        }));
      return { ...plan, modules };
    });

    return res.status(200).json({
      message: "Plans fetched successfully",
      data: plansWithModules
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
      error: error.message
    });
  }
};



export const updatePlan = async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const { id } = req.params; // plan id from URL

    const {
      name,
      base_price = 0,
      currency = "USD",
      invoice_limit = 0,
      additional_invoice_price = 0,
      user_limit = 1,
      storage_capacity_gb = 5,
      billing_cycle = "Monthly",
      status = "Active",
      description = "",
      modules = []
    } = req.body;

    if (!id) {
      conn.release();
      return res.status(400).json({ message: "Plan ID is required" });
    }

    await conn.beginTransaction();

    // 1. Update plan info
    await conn.query(
      `UPDATE plans SET 
        name=?, base_price=?, currency=?, invoice_limit=?, additional_invoice_price=?, 
        user_limit=?, storage_capacity_gb=?, billing_cycle=?, status=?, description=? 
       WHERE id=?`,
      [
        name,
        base_price,
        currency,
        invoice_limit,
        additional_invoice_price,
        user_limit,
        storage_capacity_gb,
        billing_cycle,
        status,
        description,
        id
      ]
    );

    // 2. Update modules (delete old & insert new)
    await conn.query("DELETE FROM plan_modules WHERE plan_id=?", [id]);

    if (Array.isArray(modules) && modules.length > 0) {
      const values = modules.map(m => [id, m.module_id, m.module_price || 0]);
      await conn.query(
        "INSERT INTO plan_modules (plan_id, module_id, module_price) VALUES ?",
        [values]
      );
    }

    await conn.commit();
    conn.release();

    return res.status(200).json({ message: "Plan updated successfully" });
  } catch (error) {
    await conn.rollback();
    conn.release();
    return res.status(500).json({
      message: "Internal server error",
      error: error.message
    });
  }
};




// ✅ Get Plan By ID
export const getPlanById = async (req, res) => {
  try {
    const { id } = req.params; 
    if (!id) {
      return res.status(400).json({ message: "Plan ID is required" });
    }
    const [[plan]] = await pool.query("SELECT * FROM plans WHERE id = ?", [id]);
    if (!plan) {
      return res.status(404).json({ message: "Plan not found" });
    }
    return res.status(200).json({
      message: "Plan fetched successfully",
      data: plan,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};


export const getPlanWithModules = async (req, res) => {
  try {
    const { id } = req.params;

    const [[plan]] = await pool.query("SELECT * FROM plans WHERE id = ?", [id]);
    if (!plan) return res.status(404).json({ message: "Plan not found" });

    const [mods] = await pool.query(
      `SELECT m.id, m.\`key\`, m.label, pm.module_price
       FROM plan_modules pm
       JOIN modules m ON m.id = pm.module_id
       WHERE pm.plan_id = ?`,
      [id]
    );

    return res.status(200).json({ message: "Plan fetched successfully", data: { ...plan, modules: mods } });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

export const deletePlan = async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const { id } = req.params;

    if (!id) {
      conn.release();
      return res.status(400).json({ message: "Plan ID is required" });
    }

    // Check if plan exists
    const [[plan]] = await conn.query("SELECT id FROM plans WHERE id = ?", [id]);
    if (!plan) {
      conn.release();
      return res.status(404).json({ message: "Plan not found" });
    }

    await conn.beginTransaction();

    // First delete related plan_modules
    await conn.query("DELETE FROM plan_modules WHERE plan_id = ?", [id]);
    await conn.query("DELETE FROM companies WHERE plan_id = ?", [id]);


    // Then delete plan
    await conn.query("DELETE FROM plans WHERE id = ?", [id]);

    await conn.commit();
    conn.release();

    return res.status(200).json({ message: "Plan deleted successfully" });
  } catch (error) {
    await conn.rollback();
    conn.release();
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

