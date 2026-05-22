import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    productName: {
      type: String,
      required: true,
    },
    action: {
      type: String,
      enum: ["add", "reduce", "create", "update", "delete"],
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      default: 0,
    },
    note: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

export const Transaction = mongoose.model("Transaction", transactionSchema);
