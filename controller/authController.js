import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/user.js";

// SignIn Controller
export const signIn = async (req, res) => {
  const { username, password } = req.body;
  console.log("Received:", req.body);

  try {
    // Check if user exists in the database
    const userExist = await User.findOne({ username });
    if (!userExist) {
      console.log("User not found");
      return res.status(400).json({ message: "User doesn't exist" });
    }

    // Compare the provided password with the stored hash
    const isMatch = await bcrypt.compare(password, userExist.password);
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
      return res.status(200).json({
        id: userExist._id,
        role: userExist.role,
        token,
      });
    } else {
      console.log("Invalid credentials");
      return res.status(400).json({ message: "Invalid credentials" });
    }
  } catch (error) {
    console.error("Error during sign-in:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// SignUp Controller
export const signUp = async (req, res) => {
  try {
    const { username, email, password, address } = req.body;

    // Validate username length
    if (username.length <= 4) {
      return res.status(400).json({
        message: "Username length should be greater than 3 characters",
      });
    }

    // Check if username or email already exists
    const existingUsernameOrEmail = await User.findOne({
      $or: [{ username }, { email }],
    });
    if (existingUsernameOrEmail) {
      return res
        .status(400)
        .json({ message: "Username or Email already exists" });
    }

    // Validate password length
    if (password.length <= 5) {
      return res.status(400).json({
        message: "Password length should be greater than 5 characters",
      });
    }

    // Hash the password before saving it to the database
    const hashpass = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      email,
      password: hashpass,
      address,
    });

    // Save the new user to the database
    await newUser.save();

    console.log("User signed up successfully");
    return res.status(201).json({ message: "Sign up successful" });
  } catch (error) {
    console.error("Error during sign-up:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
