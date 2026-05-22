import { Router } from "express";
import { Product } from "../models/Product.js";
import { Transaction } from "../models/Transaction.js";

const router = Router();

router.get("/", async (_req, res, next) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const product = await Product.create(req.body);
    await Transaction.create({
      product: product._id,
      productName: product.name,
      action: "create",
      quantity: product.quantity,
      note: "Product created",
    });
    res.status(201).json(product);
  } catch (error) {
    next(error);
  }
});

router.patch("/:id", async (req, res, next) => {
  try {
    const before = await Product.findById(req.params.id);
    if (!before) {
      return res.status(404).json({ message: "Product not found" });
    }

    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    await Transaction.create({
      product: product._id,
      productName: product.name,
      action: "update",
      quantity: product.quantity - before.quantity,
      note: "Product updated",
    });

    res.json(product);
  } catch (error) {
    next(error);
  }
});

router.post("/:id/stock", async (req, res, next) => {
  try {
    const { action, quantity } = req.body;
    const amount = Number(quantity);

    if (!["add", "reduce"].includes(action) || Number.isNaN(amount) || amount <= 0) {
      return res.status(400).json({ message: "Use add/reduce with a positive quantity" });
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    product.quantity = action === "add" ? product.quantity + amount : Math.max(0, product.quantity - amount);
    await product.save();

    await Transaction.create({
      product: product._id,
      productName: product.name,
      action,
      quantity: amount,
      note: `${action === "add" ? "Added" : "Reduced"} stock`,
    });

    res.json(product);
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    await Transaction.create({
      product: product._id,
      productName: product.name,
      action: "delete",
      quantity: product.quantity,
      note: "Product deleted",
    });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
