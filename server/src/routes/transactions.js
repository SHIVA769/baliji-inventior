import { Router } from "express";
import { Transaction } from "../models/Transaction.js";

const router = Router();

router.get("/", async (_req, res, next) => {
  try {
    const transactions = await Transaction.find().sort({ createdAt: -1 }).limit(100);
    res.json(transactions);
  } catch (error) {
    next(error);
  }
});

export default router;
