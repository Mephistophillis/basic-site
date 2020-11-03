const { Router } = require('express')
const Course = require('../models/course')
const { courseValidators } = require('../utils/validators')
const { validationResult } = require('express-validator')

const auth = require('../middleware/auth')
const router = Router()

const isOwner = (course, req) =>
  course.userId.toString() === req.user.id.toString()

router.get('/', async (req, res) => {
  try {
    const courses = await Course.find()
      .populate('userId', 'email name')
      .select('price title img')

    res.render('courses', {
      title: 'Courses page',
      isCourses: true,
      userId: req.user ? req.user._id.toString() : null,
      courses,
      data: {},
    })
  } catch (err) {
    console.log(err)
  }
})

router.get('/:id/edit', auth, courseValidators, async (req, res) => {
  const { allow } = req.query
  const { id } = req.params
  if (!allow) return res.redirect('/')

  try {
    const course = await Course.findById(id)

    if (!isOwner(course, req)) {
      return res.redirect('/courses')
    }

    res.render('course-edit', {
      title: `Edit course - ${course.title}`,
      course,
    })
  } catch (err) {
    console.log(err)
  }
})

router.post('/edit', auth, async (req, res) => {
  const { id } = req.body
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    return res.status(422).redirect(`/courses/${id}/edit?allow=true`)
  }

  try {
    delete req.body.id
    const course = await Course.findById(id)

    if (!isOwner(course, req)) return res.redirect('/courses')

    Object.assign(course, req.body)
    await course.save()

    res.redirect('/courses')
  } catch (err) {
    console.log(err)
  }
})

router.post('/remove', auth, async (req, res) => {
  try {
    await Course.deleteOne({
      _id: req.body.id,
      userId: req.user._id,
    })
    res.redirect('/courses')
  } catch (err) {
    console.log(err)
  }
})

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const course = await Course.findById(id)

    res.render('course', {
      title: `Course detail - ${course.title}`,
      course,
    })
  } catch (err) {
    console.log(err)
  }
})

module.exports = router
