import { pool } from "../config/db.js";

export const getDashboardStats = async (req, res) => {
  try {
    // 1. Total companies
    const [[{ total_companies }]] = await pool.query(
      "SELECT COUNT(*) as total_companies FROM companies"
    );

    // 2. Total plan requests
    const [[{ total_requests }]] = await pool.query(
      "SELECT COUNT(*) as total_requests FROM plan_requests"
    );

    // 3. Total revenue (example: SUM of plan base_price + modules)
    const [[{ total_revenue }]] = await pool.query(
      `SELECT IFNULL(SUM(p.base_price),0) as total_revenue
       FROM companies c
       JOIN plans p ON c.plan_id = p.id`
    );

    // 4. New signups (companies created this month)
    const [[{ new_signups }]] = await pool.query(
      `SELECT COUNT(*) as new_signups 
       FROM companies 
       WHERE MONTH(start_date) = MONTH(CURRENT_DATE())
       AND YEAR(start_date) = YEAR(CURRENT_DATE())`
    );

    // 5. Growth chart (companies grouped by month)
    const [growth] = await pool.query(
      `SELECT MONTH(start_date) as month, COUNT(*) as count
       FROM companies
       WHERE YEAR(start_date) = YEAR(CURRENT_DATE())
       GROUP BY MONTH(start_date)
       ORDER BY month`
    );

    // 6. Signup Company (same as growth but cumulative for bar chart)
    const [signupCompanies] = await pool.query(
      `SELECT MONTH(start_date) as month, COUNT(*) as count
       FROM companies
       WHERE YEAR(start_date) = YEAR(CURRENT_DATE())
       GROUP BY MONTH(start_date)
       ORDER BY month`
    );

    // 7. Revenue Trends (monthly revenue)
    const [revenueTrends] = await pool.query(
      `SELECT MONTH(c.start_date) as month, SUM(p.base_price) as revenue
       FROM companies c
       JOIN plans p ON c.plan_id = p.id
       WHERE YEAR(c.start_date) = YEAR(CURRENT_DATE())
       GROUP BY MONTH(c.start_date)
       ORDER BY month`
    );

    return res.status(200).json({
      message: "Dashboard stats fetched successfully",
      data: {
        total_companies,
        total_requests,
        total_revenue,
        new_signups,
        growth,
        signupCompanies,
        revenueTrends
      }
    });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};
