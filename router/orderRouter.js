import express from "express";
import { User } from "../models/user.js";
import { authenticateToken } from "./userAuth.js";
import { Books } from "../models/book.js";
import { Order } from "../models/order.js";
import Stripe from "stripe";
import { config } from "dotenv";
import dotenv from "dotenv";
import { CartItem } from "../models/cartitem.js";

const router = express.Router();

config({ path: "./config/config.env" });

dotenv.config();

const stripe = new Stripe(`${process.env.STRIPE_SK_KEY}`);

router.post("/make-payment", authenticateToken, async (req, res) => {
  try {
    const { id } = req.headers;
    const cartOrders = req.body;

    if (!id || !cartOrders || cartOrders.length === 0) {
      return res
        .status(400)
        .json({ message: "Bad request: Missing required fields" });
    }

    const lineItems = cartOrders.map((product) => ({
      price_data: {
        currency: "inr",
        product_data: {
          name: product?.book.title,
        },
        unit_amount: product.book.price * 100,
      },
      quantity: product.quantity,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${process.env.FRONTEND_URL}/payment-success`,
      cancel_url: `${process.env.FRONTEND_URL}`,
    });

    res.status(200).send({ id: session.id, message: "Payment Done" });
  } catch (error) {
    console.error("Error placing order:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/payment-success", authenticateToken, async (req, res) => {
  try {
    const { id } = req.headers;

    const cartitems = await CartItem.find({ user: id });
    
    if (!cartitems || cartitems.length === 0) {
      console.log("Cart is empty, cannot create a new order.");
      return res.status(400).json({ message: "No items in cart to place order or order already placed." });
    }

    const totalamount = cartitems.reduce((sum, item) => sum + item.totalamount, 0); 
    const totalquantity = cartitems.reduce((sum, item) => sum + item.quantity, 0); 

    const bookarray = cartitems.map(item => item.book); 

    // Create new order
    const newOrder = new Order({
      user: id,
      book: bookarray,
      quantity: totalquantity,
      totalamount,
    });

    await newOrder.save(); // Ensure order is saved before moving forward

    // Remove the cart items for the user
    await CartItem.deleteMany({ user: id });
    console.log("Cart items deleted for user:", id);

    // Add the new order to the user's orders array
    await User.updateOne({ _id: id }, { $push: { orders: newOrder._id } });
    console.log("Order created successfully with ID:", newOrder._id);

    res.status(200).json({ message: "Order placed successfully", orderId: newOrder._id });

  } catch (error) {
    console.error("Error in payment-success route:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});


//get specific user order history

router.get("/get-order-history", authenticateToken, async (req, res) => {
  try {
    const { id } = req.headers;

   const userOrder = await Order.find({user:id}).populate("book");
   const reversedOrders = userOrder.reverse();

   console.log("userOrder", reversedOrders);
   console.log("userOrder", JSON.stringify(userOrder, null, 2));
/* /    const orderdata = userData.orders.reverse();
 */
    return res.json({
      status: "Success",
      message: "Order value fetched successfully",
      data: userOrder,
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
