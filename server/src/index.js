import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDatabase } from "./lib/db.js";
import productRoutes from "./routes/products.js";
import transactionRoutes from "./routes/transactions.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
  })
);
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "inventory-admin-server" });
});

app.use("/api/products", productRoutes);
app.use("/api/transactions", transactionRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({
    message: err.message || "Something went wrong",
  });
});

connectDatabase()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server running on http://localhost:${port}`);
    });
  })
  .catch((error) => {
    console.error("Database connection failed:", error.message);
    process.exit(1);
  });
