import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    size: {
      type: String,
      required: true,
      trim: true,
    },
    unit: {
      type: String,
      enum: ["kg", "meter", "pcs", "bundle"],
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    lowStockLimit: {
      type: Number,
      required: true,
      min: 0,
      default: 5,
    },
  },
  { timestamps: true }
);

export const Product = mongoose.model("Product", productSchema);
