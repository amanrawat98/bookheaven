import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  user: { type: mongoose.Types.ObjectId, ref: "User" },
  book: { type: mongoose.Types.ObjectId, ref: "Books" },
  status: {
    type: String,
    default: "Order Placed",
    enum: ["Order Placed", "Out for Delivery", "Delivered", "Canceled"],
  },
},{timestamps:true});


export const Order = mongoose.model("order", userSchema);
