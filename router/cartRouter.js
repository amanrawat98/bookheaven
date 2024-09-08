import express from "express";
import { User } from "../models/user.js";
import { authenticateToken } from "./userAuth.js";
import { Books } from "../models/book.js";
import { CartItem } from "../models/cartitem.js";

const router = express.Router();

//Add to Cart

router.post("/add-book-to-cart", authenticateToken, async (req, res) => {
  try {
    const { bookid, id } = req.headers;
    const { itemQuantity } = req.body;

    console.log("quantity", itemQuantity);

    const isCartItem = await CartItem.exists({ book: bookid, user: id });
    const book = await Books.findById(bookid);

    if (isCartItem) {
      return res.status(400).json({ message: "Book is already in Cart" });
    }

    console.log("book price is", book.price);

    const totalamount = book.price * itemQuantity;

    const newBookItem = new CartItem({
      user: id,
      book: bookid,
      quantity: itemQuantity,
      totalamount: totalamount,
    });

    console.log("newBookItem", newBookItem);
    await newBookItem.save();

    return res.status(200).json({ message: "Book added To Cart successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
});

//delete

router.put(
  "/delete-book-from-cart/:bookid",
  authenticateToken,
  async (req, res) => {
    try {
      const { bookid } = req.params;
      const { id } = req.headers;

      const isCartItem = await CartItem.exists({ book: bookid, user: id });

      if (!isCartItem) {
        return res.status(400).json({ message: "Book not in Cart" });
      }

      await CartItem.deleteOne({ book: bookid, user: id });

      return res
        .status(200)
        .json({ message: "Book deleted successfully from Cart" });
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  }
);

//get all books from cart

router.get("/get-books-from-cart", authenticateToken, async (req, res) => {
  try {
    const { id } = req.headers;

    if (!id) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const userbooks = await CartItem.find({ user: id })
      .populate("user")
      .populate("book");

    console.log(userbooks, "userbooks");

    if (!userbooks) {
      res.status(400).json({ message: "No Item in Cart" });
    }

    return res
      .status(200)
      .json({ message: "User All CartItems Fetched", userbooks });
  } catch (error) {
    console.error(error); // Log the error for debugging
    return res.status(500).json({ message: "Internal server error" });
  }
});

router.put(
  "/update-cart-quantity/:bookid",
  authenticateToken,
  async (req, res) => {
    const { id } = req.headers;
    const { bookid } = req.params;
    const { itemquantity } = req.body;

    const book = await Books.find({ _id: bookid });

    let bookPrice = book[0].price;

    let updatedBookPrice = bookPrice * itemquantity;

    const cartItem = await CartItem.exists({ user: id, book: bookid });

    if (!cartItem) {
      return res.status(400).json({ message: "Invalid Book Id" });
    }

    await CartItem.updateOne(
      { user: id, book: bookid },
      { $set: { quantity: itemquantity, totalamount: updatedBookPrice } }
    );
    return res.status(200).json({ message: "Item Quantity Updated" });
  }
);

export default router;
