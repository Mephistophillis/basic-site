const { Router } = require("express");
const Cart = require("../models/cart");
const Course = require("../models/course");

const router = Router();

router.get("/", async (req, res) => {
  const cart = await Cart.fetch();

  res.render("cart", {
    title: "Cart",
    isCart: true,
    courses: cart.courses,
    price: cart.price
  });
});

router.post("/add", async (req, res) => {
  const { id } = req.body;
  const course = await Course.getById(id);

  await Cart.add(course);
  res.redirect("/cart");
});

router.delete("/remove/:id", async (req, res) => {
  const { id } = req.params;
  const cart = await Cart.remove(id);

  res.status(200).json(cart);
});

module.exports = router;
