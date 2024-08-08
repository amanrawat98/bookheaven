import express from "express";
import { User } from "../models/user.js";
import { authenticateToken } from "./userAuth.js";
import { Books } from "../models/book.js";

const router = express.Router();

//Add to favourite

router.put("/add-book-to-favourite", authenticateToken, async (req, res) => {
  try {
    const { bookid, id } = req.headers;
    const userdata = await User.findById(id);
    const isBookFavourite = userdata.favourites.includes(bookid);
    if (isBookFavourite) {
     return res.status(200).json({ message: "Book is already in favourite" });
    }

    await User.findByIdAndUpdate(id, { $push: { favourites: bookid } });
   return res.status(200).json({ message: "Book added to Favourites successfully" });
  } catch (error) {
   return res.status(500).json({ message: "Internal server error" });
  }
});

//delete

router.put(
  "/delete-book-to-favourite",
  authenticateToken,
  async (req, res) => {
    try {
      const { bookid, id } = req.headers;
      const userdata = await User.findById(id);
      const isBookFavourite = userdata.favourites.includes(bookid);
      if (isBookFavourite) {
        await User.findByIdAndUpdate(id, { $pull: { favourites: bookid } });
      return  res
          .status(200)
          .json({ message: "Book deleted successfully from favourite" });
      }

    return  res.status(200).json({ message: "Book not in favourite" });
    } catch (error) {
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }
);


//favourite books

router.get('/get-favourite-books', authenticateToken, async (req, res) => {
  try {
    const { id } = req.headers;

    if (!id) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    const userData = await User.findById(id).populate('favourites'); // Populate favourites

    if (!userData) {
      return res.status(404).json({ message: 'User not found' });
    }

    const favouriteBooks = userData.favourites;
    return res.status(200).json({ data: favouriteBooks });
  } catch (error) {
    console.error(error); // Log the error for debugging
    return res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
