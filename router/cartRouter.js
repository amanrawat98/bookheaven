import express from "express";
import { User } from "../models/user.js";
import { authenticateToken } from "./userAuth.js";
import { Books } from "../models/book.js";

const router = express.Router();

//Add to Cart

router.put("/add-book-to-cart", authenticateToken, async (req, res) => {
  try {
    const { bookid, id } = req.headers;
    const userdata = await User.findById(id);
    const isBookInCart = userdata.carts.includes(bookid);
    if (isBookInCart) {
      return res.status(200).json({ message: "Book is already in Cart" });
    }

    await User.findByIdAndUpdate(id, { $push: { carts: bookid } });
    return res.status(200).json({ message: "Book added To Cart successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
});

//delete

router.put("/delete-book-from-cart/:bookid", authenticateToken, async (req, res) => {
  try {
    const { bookid } = req.params;
    const {id} = req.headers;
    const userdata = await User.findById(id);
    const isBookInCart = userdata.carts.includes(bookid);
    if (isBookInCart) {
      await User.findByIdAndUpdate(id, { $pull: { carts: bookid } });
      return res
        .status(200)
        .json({ message: "Book deleted successfully from Cart" });
    }

    return res.status(200).json({ message: "Book not in Cart" });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
});

//get all books from cart

router.get("/get-books-from-cart", authenticateToken, async (req, res) => {
  try {
    const { id } = req.headers;

    if (!id) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const userData = await User.findById(id).populate("carts"); // Populate favourites

    if (!userData) {
      return res.status(404).json({ message: "User not found" });
    }

    const cartBooks = userData.carts.reverse();
    return res.status(200).json({ data: cartBooks });
  } catch (error) {
    console.error(error); // Log the error for debugging
    return res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
