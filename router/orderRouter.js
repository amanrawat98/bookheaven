import express from "express";
import { User } from "../models/user.js";
import { authenticateToken } from "./userAuth.js";
import { Books } from "../models/book.js";
import { Order } from "../models/order.js";
import Stripe from "stripe";
import { config } from "dotenv";
import dotenv from "dotenv";

const router = express.Router();

config({ path: "./config/config.env" });

dotenv.config();

const stripe = new Stripe(`${process.env.STRIPE_SK_KEY}`);

router.post("/make-payment", authenticateToken, async (req, res) => {
  try {
    const { id } = req.headers;
    const cartOrders = req.body;
    console.log("cartOrders", cartOrders);

    if (!id || !cartOrders || cartOrders.length === 0) {
      return res
        .status(400)
        .json({ message: "Bad request: Missing required fields" });
    }

    const lineItems = cartOrders.map((product) => ({
      price_data: {
        currency: "inr",
        product_data: {
          name: product.title,
        },
        unit_amount: product.price * 100,
      },
      quantity: 1,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${process.env.REACT_APP_API_BASE_URL}/payment-success`,
      cancel_url: `${process.env.REACT_APP_API_BASE_URL}`,
    });

    console.log("session ", session);
    res.status(200).send({ id: session.id, message: "Payment Done" });
  } catch (error) {
    console.error("Error placing order:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/payment-success", authenticateToken, async (req, res) => {
  try {
    const { id } = req.headers;

    const user = await User.findById(id).populate("carts");
    const cartOrders = user.carts;

    if (!cartOrders || cartOrders.length === 0) {
      return res
        .status(400)
        .json({ message: "Bad request: No items in cart to place order" });
    }

    for (const orderData of cartOrders) {
      const newOrder = new Order({ user: id, book: orderData._id });
      const orderDataFromDb = await newOrder.save();

      await User.findByIdAndUpdate(id, {
        $push: { orders: orderDataFromDb._id },
      });

      await User.findByIdAndUpdate(id, {
        $pull: { carts: orderDataFromDb.book },
      });

    }
  } catch (error) {
    console.error("Error in payment-success route:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

//get specific user order history

router.get("/get-order-history", authenticateToken, async (req, res) => {
  try {
    const { id } = req.headers;

    const data = await User.findById(id);
    console.log("data", data);

    const date = await User.findById(id).populate("orders");

    const userData = await User.findById(id).populate({
      path: "orders",
      populate: { path: "book" },
    });

    console.log("userData", userData);
    console.log("date", date);

    const orderdata = userData.orders.reverse();

    return res.json({
      status: "Success",
      message: "Order value fetched successfully",
      data: orderdata,
    });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

//get user order history

router.get("/get-all-history", authenticateToken, async (req, res) => {
  try {
    const userData = await Order.find()
      .populate({
        path: "user",
      })
      .populate({
        path: "book",
      })
      .sort({ createdAt: -1 });
    return res.json({
      status: "Success",
      message: "Order Placed Successfully",
      data: userData,
    });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

//update-order-history

router.put("/update-status/:orderid", async (req, res) => {
  const { orderid } = req.params;
  const { id } = req.headers;
  console.log(req.body.status);
  console.log("order Id", orderid);

  try {
    const user = await User.findById(id);

    if (user.role === "admin") {
      const updatedUser = await Order.findByIdAndUpdate(orderid, {
        status: req.body.status,
      });
      return res.status(200).json({ status: "success", data: updatedUser });
    }
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

export default router;
