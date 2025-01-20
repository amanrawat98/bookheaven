import express from "express";
import { User } from "../models/user.js";
import { authenticateToken } from "./userAuth.js";
import { signIn, signUp } from "../controller/authController.js";

const router = express.Router();

router.post("/sign-up", signUp);

router.post("/sign-in", signIn);

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
