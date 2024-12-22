import express from "express";
import { User } from "../models/user.js";
import jwt from "jsonwebtoken";
import { authenticateToken } from "./userAuth.js";
import multer from "multer";

import { Books } from "../models/book.js";

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage: storage });

const isImage = (req, file, callback) => {
  if (file.mimetype.startsWith("image")) {
    callback(null, true);
  } else {
    callback(new Error("Only Img Allowed"));
  }
};

//add Book
router.post("/add-book", upload.single("file"), async (req, res) => {
  console.log("add book done");

  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    console.log("Uploading file...");
    console.log("Body is", req.body); // Log the rest of the form data

    // Validate required fields
    const { title, author, price, desc, language, quantity } = req.body;
    if (!title || !author || !price || !desc || !language || !quantity) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Get user from headers
    const { id } = req.headers;
    const user = await User.findById(id);
    if (user.role !== "admin") {
      return res.status(400).json({ message: "You are not an Admin" });
    }

    // Uploading to Cloudinary
    const cloudinaryResponse = await cloudinary.uploader.upload(req.file.path).catch(err => {
      console.error("Cloudinary upload error:", err);
      throw new Error("Cloudinary upload failed");
    });

    const book = new Books({
      url: cloudinaryResponse.secure_url,
      title,
      author,
      price,
      desc,
      language,
      quantity,
    });

    await book.save();

    res.status(200).json({ message: "Book added successfully" });
  } catch (error) {
    console.error(error); // Log the error for debugging
    res.status(500).json({ message: "Internal server error", error: error.message });
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

router.get("/get-all-books", async (req, res) => {
  try {
    console.log("api reached...");
    const books = await Books.find().sort({ createdAt: -1 });
    return res.json({ status: "success", data: books });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
});

//get book by id

router.get("/get-book-by-id/:id", async (req, res) => {
  const { id } = req.params;

  console.log("book id is", id);
  try {
    const book = await Books.findById(id);

    return res
      .status(200)
      .json({ message: "Book Find Successfully", data: book });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
