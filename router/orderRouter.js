import express from "express";
import { User } from "../models/user.js";
import { authenticateToken } from "./userAuth.js";
import { Books } from "../models/book.js";
import { Order } from "../models/order.js";
import Stripe from "stripe";

const router = express.Router();
const stripe = new Stripe(
  "sk_test_51Pu7rMP8NeAGBdCVSMVk58m5oFqLznpoNOnpeJwOgvu3ryMCxOHUe0x7HyowgFyg8btPgepFf6bqToN0hXqqoqnE00C6zpSqBX"
);

router.put("/place-order", authenticateToken, async (req, res) => {
  try {
    const { id } = req.headers;
    const cartOrders = req.body;

    console.log("id", id);
    console.log("cartOrders", cartOrders);

    if (!id || !cartOrders) {
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

    const session = await stripe.checkout.session.create({
      payment_methods_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: "http://localhost:5173/success",
      cancel_url: "http://localhost:5173/cancel",
    });

    for (const orderdata of cartOrders) {
      const newOrder = new Order({ user: id, book: orderdata._id });
      const orderdataFromDb = await newOrder.save();

      await User.findByIdAndUpdate(id, {
        $push: { orders: orderdataFromDb._id },
      });

      const cartDetails = await User.findByIdAndUpdate(id, {
        $pull: { carts: orderdataFromDb.book },
      });

      console.log("deatails are", cartDetails);
    }

    return res.json({
      status: "Success",
      message: "Order Placed Successfully",
      id: session.id,
    });
  } catch (error) {
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
