const { Router } = require("express");
const Course = require("../models/course");
const { courseValidators } = require('../utils/validators')
const { validationResult } = require('express-validator')

const auth = require("../middleware/auth");
const router = Router();

router.get("/", auth, (req, res) => {
  res.render("add", {
    title: "Add courses page",
    isAdd: true,
    data: {}
  });
});

router.post("/", auth, courseValidators, async (req, res) => {
  const { title, price, img } = req.body;

  const errors = validationResult(req)

  if(!errors.isEmpty()) {
    return res.status(422).render('add', {
      title: "Add courses page",
      isAdd: true,
      error: errors.array()[0].msg,
      data: {
        title,
        price,
        img,
      }
    })
  }

  const course = new Course({
    title,
    price,
    img,
    userId: req.user
  });

  try {
    await course.save();
    res.redirect("/courses");
  } catch (err) {
    console.log(err);
  }
});

module.exports = router;
