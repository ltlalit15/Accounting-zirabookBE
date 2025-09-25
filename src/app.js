// import express from "express";
// import cors from "cors";
// import dotenv from "dotenv";

// import fileUpload from "express-fileupload";
// dotenv.config();

// import usersRoutes from "./routes/users.routes.js";
// import modulesRoutes from "./routes/modules.routes.js";
// import plansRoutes from "./routes/plans.routes.js";
// import companiesRoutes from "./routes/companies.routes.js";
// import authRoutes from "./routes/auth.routes.js";
// import requestForPlanRoutes from "./routes/requestforplan.routes.js";
// import dashboardRoutes from "./routes/dashboard.routes.js";
// import companyUsersRoutes from "./routes/companyUsers.routes.js";

// import categoryRoutes from "./routes/category.routes.js";

// import subgroupRoutes from "./routes/subgroup.routes.js";

// import accountRoutes from "./routes/account.routes.js";

// import adminuserRoutes from "./routes/adminuser.routes.js";

// import roletypeRoutes from "./routes/roletype.routes.js";

// import roleRoutes from "./routes/role.routes.js";

// import roleModuleRoutes from "./routes/rolemodule.routes.js";

// import vendorRoutes from "./routes/vendors.routes.js";

// import customerRoutes from "./routes/customers.routes.js";

// import transactionRoutes from "./routes/transaction.routes.js";

// import warehouseRoutes from "./routes/warehouses.routes.js";

// import uomRoutes from "./routes/uom.routes.js";

// import unitdetailRoutes from "./routes/unitdetail.routes.js";

// import itemCategoryRoutes from "./routes/itemcategory.routes.js";

// import productsRoutes from "./routes/product.routes.js";

// import serviceRoutes from "./routes/service.routes.js";

// import voucherRoutes from "./routes/voucher.routes.js";


// const app = express();


// app.use(
//   fileUpload({
//     useTempFiles: true,
//     tempFileDir: "/tmp/",
//   })
// );


// app.use(cors());
// app.use(express.json({ limit: "5mb" }));
// // ===== Test Route =====
// app.get("/", (req, res) => {
//   res.status(200).json({ status: true, message: "SaaS API running 🚀" });
// });


// app.use("/api/users", usersRoutes);
// app.use("/api/modules", modulesRoutes);
// app.use("/api/plans", plansRoutes);
// app.use("/api/companies", companiesRoutes);
// app.use("/api/auth", authRoutes);
// app.use("/api/requestplan", requestForPlanRoutes);
// app.use("/api/dashboard", dashboardRoutes);
// app.use("/api/companyusers", companyUsersRoutes);
// app.use("/api/category", categoryRoutes);
// app.use("/api/subgroup", subgroupRoutes);
// app.use("/api/account", accountRoutes);
// app.use("/api/adminuser", adminuserRoutes);
// app.use("/api/roletype", roletypeRoutes);
// app.use("/api/role", roleRoutes);
// app.use("/api/roleModule", roleModuleRoutes);
// app.use("/api/vendor", vendorRoutes);
// app.use("/api/customers", customerRoutes);
// app.use("/api/transaction", transactionRoutes);
// app.use("/api/warehouses", warehouseRoutes);
// app.use("/api/uom", uomRoutes);
// app.use("/api/unitdetail", unitdetailRoutes);
// app.use("/api/itemcategory", itemCategoryRoutes);
// app.use("/api/products", productsRoutes);
// app.use("/api/services", serviceRoutes);
// app.use("/api/voucher", voucherRoutes);


// const PORT = process.env.PORT || 4000;
// app.listen(PORT, () => console.log(`Server started on http://localhost:${PORT}`));




import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fileUpload from "express-fileupload";

dotenv.config();

import usersRoutes from "./routes/users.routes.js";
import modulesRoutes from "./routes/modules.routes.js";
import plansRoutes from "./routes/plans.routes.js";
import companiesRoutes from "./routes/companies.routes.js";
import authRoutes from "./routes/auth.routes.js";
import requestForPlanRoutes from "./routes/requestforplan.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import companyUsersRoutes from "./routes/companyUsers.routes.js";
import categoryRoutes from "./routes/category.routes.js";
import subgroupRoutes from "./routes/subgroup.routes.js";
import accountRoutes from "./routes/account.routes.js";
import adminuserRoutes from "./routes/adminuser.routes.js";
import roletypeRoutes from "./routes/roletype.routes.js";
import roleRoutes from "./routes/role.routes.js";
import roleModuleRoutes from "./routes/rolemodule.routes.js";
import vendorRoutes from "./routes/vendors.routes.js";
import customerRoutes from "./routes/customers.routes.js";
import transactionRoutes from "./routes/transaction.routes.js";
import warehouseRoutes from "./routes/warehouses.routes.js";
import uomRoutes from "./routes/uom.routes.js";
import unitdetailRoutes from "./routes/unitdetail.routes.js";
import itemCategoryRoutes from "./routes/itemcategory.routes.js";
import productsRoutes from "./routes/product.routes.js";
import serviceRoutes from "./routes/service.routes.js";
import voucherRoutes from "./routes/voucher.routes.js";
import stocktranferRoutes from "./routes/stocktransfer.routes.js";
import inventoryadjustmentRoutes from "./routes/inventoryAdjustment.router.js"
import quotationRoutes from "./routes/quotation.router.js";
import salesOrderRoutes from "./routes/salesorder.routes.js";
import morgan from "morgan";

const app = express();

// Enhanced CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // In development, allow all origins
    if (process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }
    
    // In production, whitelist specific origins
    const allowedOrigins = [
      'http://localhost:5173',  // React development server
      'http://localhost:4200',  // Angular development server
      'https://zirak-book.netlify.app'  // Your production frontend
    ];
    
    // Check if the origin is in the allowed list
    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      return callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,  // Allow cookies to be sent with requests
  optionsSuccessStatus: 200,  // Some legacy browsers choke on 204
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],  // Allowed HTTP methods
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']  // Allowed headers
};

app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));

app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
  })
);

app.use(express.json({ limit: "5mb" }));

// ===== Test Route =====
app.get("/", (req, res) => {
  res.status(200).json({ status: true, message: "SaaS API running 🚀" });
});

app.use(morgan("dev"));
// All your route handlers
app.use("/api/users", usersRoutes);
app.use("/api/modules", modulesRoutes);
app.use("/api/plans", plansRoutes);
app.use("/api/companies", companiesRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/requestplan", requestForPlanRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/companyusers", companyUsersRoutes);
app.use("/api/category", categoryRoutes);
app.use("/api/subgroup", subgroupRoutes);
app.use("/api/account", accountRoutes);
app.use("/api/adminuser", adminuserRoutes);
app.use("/api/roletype", roletypeRoutes);
app.use("/api/role", roleRoutes);
app.use("/api/roleModule", roleModuleRoutes);
app.use("/api/vendor", vendorRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/transaction", transactionRoutes);
app.use("/api/warehouses", warehouseRoutes);
app.use("/api/uom", uomRoutes);
app.use("/api/unitdetail", unitdetailRoutes);
app.use("/api/itemcategory", itemCategoryRoutes);
app.use("/api/products", productsRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/voucher", voucherRoutes);
app.use("/api/stocktransfer", stocktranferRoutes );
app.use("/api/inventoryadjustment", inventoryadjustmentRoutes);
app.use("/api/quotation", quotationRoutes);
app.use("/api/salesorder", salesOrderRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server started on http://localhost:${PORT}`));
