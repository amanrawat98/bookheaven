import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    avatar: {
      type: String,
      default:
        "https://www.pngall.com/wp-content/uploads/12/Avatar-Profile-PNG-Photos.png",
    },
    role: {
      type: String,
      default: "user",
      enum: ["user", "admin"],
    },
    favourites: [{ type: mongoose.Types.ObjectId, ref: "Books" }],
    carts: [{ type: mongoose.Types.ObjectId, ref: "Books" }],
    orders: [{ type: mongoose.Types.ObjectId, ref: "order" }],
  },
  { timestamps: true }
);

export const User = mongoose.model("User", userSchema);
