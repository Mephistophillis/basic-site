const { Router } = require("express");
const Order = require("../models/order");

const auth = require("../middleware/auth");
const router = Router();

router.get("/", auth, async (req, res) => {
  try {
    const orders = await Order.find({
      "user.userId": req.user._id
    }).populate("user.userId");

    const test = orders.map(t => t.courses.map(c => c.course));
    console.log("TEST", test);
    const props = {
      isOrder: true,
      title: "Orders",
      orders: orders.map(order => ({
        ...order._doc,
        price: order.courses.reduce((total, c) => {
          return (total += c.count * c.course.price);
        }, 0)
      }))
    };
    console.log("orders", props.orders);
    res.render("orders", props);
  } catch (err) {
    console.log(err);
  }
});

router.post("/", auth, async (req, res) => {
  try {
    const user = await req.user.populate("cart.items.courseId").execPopulate();

    const courses = user.cart.items.map(c => ({
      count: c.count,
      course: { ...c.courseId._doc }
    }));

    const order = new Order({
      user: {
        name: req.user.name,
        userId: req.user
      },
      courses
    });

    await order.save();
    await req.user.clearCart();

    res.redirect("/orders");
  } catch (err) {
    console.log(err);
  }
});

module.exports = router;
