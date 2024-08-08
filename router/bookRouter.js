import express from "express";
import { User } from "../models/user.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { authenticateToken } from "./userAuth.js";
import { Books } from "../models/book.js";

const router = express.Router();

//add Book
router.post("/add-book", authenticateToken, async (req, res) => {
  try {
    const { id } = req.headers;
    const user = await User.findById(id);
    if (user.role !== "admin") {
      return res.status(400).json({ message: "You are not a Admin" });
    }
    const book = new Books({
      url: req.body.url,
      title: req.body.title,
      author: req.body.author,
      price: req.body.price,
      desc: req.body.desc,
      language: req.body.language,
    });

    await book.save();

    res.status(200).json({ message: "Book added successfull" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

//update book

router.put("/update-book", authenticateToken, async (req, res) => {
  const { bookid } = req.headers;

  try {
    
    await Books.findByIdAndUpdate(bookid, {
      url: req.body.url,
      title: req.body.title,
      author: req.body.author,
      price: req.body.price,
      desc: req.body.desc,
      language: req.body.language,
    });

    return res.status(200).json({ message: "Book updated successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
});

//delete book

router.delete("/delete-book", authenticateToken, async (req, res) => {
  const { bookid } = req.headers;

  try {
    await Books.findByIdAndDelete(bookid);

    return res.status(200).json({ message: "Book Deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
});

//get all books 

router.get("/get-all-books",async (req,res)=> {
  try {

   const books = await Books.find().sort({createdAt:-1});
   return res.json({status:'success',data:books});


  } catch(error) {
    return res.status(500).json({ message: "Internal server error" });

  }
})

//get book by id 


router.get("/get-book-by-id/:id", async (req, res) => {
  const {id} = req.params;

  try {
  const book =  await Books.findById(id);

    return res.status(200).json({ message: "Book Find Successfully" , data:book});
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
});



export default router;
