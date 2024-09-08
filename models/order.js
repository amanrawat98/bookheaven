import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Types.ObjectId, ref: "User" },
    book: [{ type: mongoose.Types.ObjectId, ref: "Books" }],
    status: {
      type: String,
      default: "Order Placed",
      enum: ["Order Placed", "Out for Delivery", "Delivered", "Canceled"],
    },
    quantity: {
      type: Number,
      required: true,
      default: 1,
    },
    totalamount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export const Order = mongoose.model("order", orderSchema);
