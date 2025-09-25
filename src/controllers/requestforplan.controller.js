import { pool } from "../config/db.js";

// 📌 1. Company Requests a Plan
export const requestPlan = async (req, res) => {
  try {
    const { company_id, plan_id, billing_cycle } = req.body;

    if (!company_id || !plan_id) {
      return res.status(400).json({ message: "company_id and plan_id are required" });
    }

    await pool.query(
      `INSERT INTO plan_requests (company_id, plan_id, billing_cycle) 
       VALUES (?, ?, ?)`,
      [company_id, plan_id, billing_cycle || "Monthly"]
    );

    return res.status(201).json({ message: "Plan request submitted successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};




// export const getRequestedPlans = async (req, res) => {
//   try {
//     const [rows] = await pool.query(
//       `SELECT r.id, c.name AS company, c.email, p.name AS plan, 
//               r.billing_cycle, r.request_date, r.status
//        FROM plan_requests r
//        LEFT JOIN companies c ON c.id = r.company_id
//        LEFT JOIN plans p ON p.id = r.plan_id
//        ORDER BY r.id DESC`
//     );

//     if (rows.length === 0) 
//       return res.status(404).json({ message: "No requested plans found" });

//     return res.status(200).json({ 
//       message: "Requested plans fetched successfully", 
//       data: rows 
//     });
//   } catch (error) {
//     return res.status(500).json({ 
//       message: "Internal server error", 
//       error: error.message 
//     });
//   }
// };

export const getRequestedPlans = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT 
          r.id, 
          COALESCE(c.name, 'Unknown Company') AS company, 
          COALESCE(c.email, 'no-email@domain.com') AS email, 
          COALESCE(p.name, 'Unknown Plan') AS plan, 
          r.billing_cycle, 
          r.request_date, 
          r.status
       FROM plan_requests r
       LEFT JOIN companies c ON c.id = r.company_id
       LEFT JOIN plans p ON p.id = r.plan_id
       ORDER BY r.id DESC`
    );

    if (rows.length === 0) {
      return res.status(404).json({ 
        message: "No requested plans found" 
      });
    }

    return res.status(200).json({ 
      message: "Requested plans fetched successfully", 
      data: rows 
    });
  } catch (error) {
    return res.status(500).json({ 
      message: "Internal server error", 
      error: error.message 
    });
  }
};





// 📌 3. Approve / Reject Plan Request
export const updatePlanRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["Approved", "Rejected"].includes(status)) {
      return res.status(400).json({ message: "Status must be either Approved or Rejected" });
    }

    const [result] = await pool.query("UPDATE plan_requests SET status = ? WHERE id = ?", [status, id]);

    if (result.affectedRows === 0) return res.status(404).json({ message: "Plan request not found" });

    return res.status(200).json({ message: `Plan request ${status.toLowerCase()} successfully` });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};



export const deletePlanRequest = async (req, res) => {
  try {
    const { id } = req.params;

    const [[reqRow]] = await pool.query("SELECT id FROM plan_requests WHERE id = ?", [id]);
    if (!reqRow) {
      return res.status(404).json({ message: "Plan request not found" });
    }

    await pool.query("DELETE FROM plan_requests WHERE id = ?", [id]);

    return res.status(200).json({ message: "Plan request deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};




