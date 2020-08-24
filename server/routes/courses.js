const { Router } = require("express");
const Course = require("../models/course");

const auth = require("../middleware/auth");
const router = Router();

router.get("/", async (req, res) => {
  const courses = await Course.find()
    .populate("userId", "email name")
    .select("price title img");

  res.render("courses", {
    title: "Courses page",
    isCourses: true,
    courses
  });
});

router.get("/:id/edit", auth, async (req, res) => {
  const { allow } = req.query;
  if (!allow) return res.redirect("/");

  const { id } = req.params;
  const course = await Course.findById(id);

  res.render("course-edit", {
    title: `Edit course - ${course.title}`,
    course
  });
});

router.post("/edit", auth, async (req, res) => {
  const { id } = req.body;
  delete req.body.id;
  await Course.findByIdAndUpdate(id, req.body);
  res.redirect("/courses");
});

router.post("/remove", auth, async (req, res) => {
  const { id } = req.body;
  try {
    await Course.deleteOne({
      _id: id
    });
    res.redirect("/courses");
  } catch (err) {
    console.log(err);
  }
});

router.get("/:id", async (req, res) => {
  const { id } = req.params;
  const course = await Course.findById(id);

  res.render("course", {
    title: `Course detail - ${course.title}`,
    course
  });
});

module.exports = router;
