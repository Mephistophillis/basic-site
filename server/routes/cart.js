const { Router } = require("express");
const Course = require("../models/course");
const router = Router();
const auth = require("../middleware/auth");

const mapCartItems = cart => {
  return cart.items.map(c => ({
    ...c.courseId._doc,
    id: c.courseId.id,
    count: c.count
  }));
};

const computePrice = courses => {
  return courses.reduce((total, course) => {
    return (total += course.price * course.count);
  }, 0);
};

router.get("/", auth, async (req, res) => {
  try {
    const user = await req.user.populate("cart.items.courseId").execPopulate();

    const courses = mapCartItems(user.cart);

    res.render("cart", {
      title: "Cart",
      isCart: true,
      courses: courses,
      price: computePrice(courses)
    });
  } catch (err) {
    console.log(err);
  }
});

router.post("/add", auth, async (req, res) => {
  const { id } = req.body;
  const course = await Course.findById(id);

  await req.user.addToCart(course);

  res.redirect("/cart");
});

router.delete("/remove/:id", auth, async (req, res) => {
  const { id } = req.params;
  await req.user.removeFromCart(id);

  const user = await req.user.populate("cart.items.courseId").execPopulate();

  console.log(user);

  const courses = mapCartItems(user.cart);
  const cart = {
    courses,
    price: computePrice(courses)
  };

  res.status(200).json(cart);
});

module.exports = router;
