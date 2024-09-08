import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema({
  user: { type: mongoose.Types.ObjectId, ref: "User" },
  book: { type: mongoose.Types.ObjectId, ref: "Books" },
  quantity: {
    type:Number,
    required:true,
    default:1
  },
  totalamount: {
    type:Number,
    default:0
  }
});

export const CartItem = mongoose.model("CartItem", cartItemSchema);
