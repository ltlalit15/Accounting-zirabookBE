// import mysql from "mysql2/promise";
// import dotenv from "dotenv";
// dotenv.config();

// export const pool = mysql.createPool({
//   host: process.env.DB_HOST,
//   user: process.env.DB_USER,
//   password: process.env.DB_PASSWORD,
//   database: process.env.DB_NAME,
//   waitForConnections: true,
//   connectionLimit: 10,
//   queueLimit: 0
// });











import mysql from 'mysql2/promise';

export const pool = mysql.createPool({
  host: "yamanote.proxy.rlwy.net",       // ✅ Updated Host
  port: 47455,                           // ✅ Updated Port
  user: "root",                          // ✅ Username
  password: "hnnHGPrwsrIcRVnPhrFjvJOrBgNsnZNU", // ✅ Password
  database: "railway",                  // ✅ Database Name
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 10000,
});
// Check connection
(async () => {
  try {
    const connection = await pool.getConnection();
    console.log("✅ Successfully connected to database");
    connection.release();
  } catch (error) {
    console.error("❌ Database connection error:", error);
  }
})();
