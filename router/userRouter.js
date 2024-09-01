import express from "express";
import { User } from "../models/user.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { authenticateToken } from "./userAuth.js";

const router = express.Router();

//signup

router.post("/sign-up", async (req, res) => {
  try {
    const { username, email, password, address } = req.body;
    if (username.length <= 4) {
      return res
        .status(400)
        .json({ message: "USername length should me greater then 3" });
    }

    const existingUsernameorEmail = await User.findOne({ username, email });
    if (existingUsernameorEmail) {
      return res
        .status(400)
        .json({ message: "Username or Email Already Exist" });
    }

    if (password.length <= 5) {
      return res
        .status(400)
        .json({ message: "Password length should me greater then 5" });
    }

    const hashpass = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      email,
      password: hashpass,
      address,
    });

    await newUser.save();

    return res.status(200).json({ message: "SignUp SuccessFully" });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

//login

router.post("/sign-in", async (req, res) => {
  const { username, password } = req.body;
  console.log("Received:", req.body);

  try {
    const userExist = await User.findOne({ username });
    console.log(userExist);
    if (!userExist) return res.status(400).json({ message: "User Dont Exist" });

    const isMatch =  bcrypt.compare(password, userExist.password);
    if (isMatch) {
      const authClaims = {
        username: userExist.username,
        role: userExist.role,
      };
      const token = jwt.sign(
        authClaims,
        process.env.JWT_SECRET || "bookstore123",
        {
          expiresIn: "30d",
        }
      );
      console.log("Login successful, token generated:", token);
      return res
        .status(200)
        .json({ id: userExist._id, role: userExist.role, token: token });
    } else {
      console.log("Invalid credentials");
      return res.status(400).json({ message: "Invalid credentials" });
    }
  } catch (error) {
   return res.status(500).json({ message: "Internal Server Error" });
  }
});

router.get("/get-user-information", authenticateToken, async (req, res) => {
  const { id } = req.headers;

  try {
    const data = await User.findById(id).select("-password");

    return res.status(200).json(data);
  } catch (error) {
   return res.status(500).json({ message: "Internal server error" });
  }
});

//change address

router.put("/update-address", authenticateToken, async (req, res) => {
  try {
    const { id } = req.headers;
    const { address } = req.body;
    await User.findByIdAndUpdate(id, { address: address });
    return res.status(200).json({ message: "Address Created Successfull" });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

export default router;
