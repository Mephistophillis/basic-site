const { Router } = require("express");
const Course = require("../models/course");

const router = Router();

router.get("/", async (req, res) => {
  const courses = await Course.getAll();

  res.render("courses", {
    title: "Courses page",
    isCourses: true,
    courses
  });
});

router.get("/:id/edit", async (req, res) => {
  const { allow } = req.query;
  if (!allow) return res.redirect("/");

  const { id } = req.params;
  const course = await Course.getById(id);

  res.render("course-edit", {
    title: `Edit course - ${course.title}`,
    course
  });
});

router.post("/edit", async (req, res) => {
  await Course.update(req.body);
  res.redirect("/courses");
});

router.get("/:id", async (req, res) => {
  const { id } = req.params;
  const course = await Course.getById(id);

  res.render("course", {
    title: `Course detail - ${course.title}`,
    course
  });
});

module.exports = router;
