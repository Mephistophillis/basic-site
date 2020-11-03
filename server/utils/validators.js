const { body } = require('express-validator')
const bcrypt = require('bcryptjs')
const User = require('../models/user')

exports.registerValidators = [
  body('email')
    .isEmail()
    .withMessage('Введите корректный email')
    .custom(async (value, req) => {
      try {
        const user = await User.findOne({ email: value })
        if (user) {
          return Promise.reject('Такой email уже занят')
        }
      } catch (err) {
        console.log(err)
      }
    })
    .normalizeEmail(),

  body('password', 'Пароль должен содержать не мение 6 символов')
    .isLength({ min: 6, max: 56 })
    .isAlphanumeric()
    .trim(),

  body('confirm')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Пароли должны совпадать')
      }
      return true
    })
    .trim(),

  body('name')
    .isLength({ min: 3 })
    .withMessage('Короткое имя')
    .trim(),
]

exports.loginValidators = [
  body('email')
    .isEmail()
    .withMessage('Введите корректный email')
    .custom(async (value, req) => {
      try {
        const user = await User.findOne({ email: value })
        if (!user) {
          return Promise.reject('Такого пользователя не существует')
        }
      } catch (err) {
        console.log(err)
      }
    })
    .normalizeEmail(),

  body('password', 'Пароль должен содержать не мение 6 символов')
    .isLength({ min: 6, max: 56 })
    .isAlphanumeric()
    .custom(async (value, { req }) => {
      const user = await User.findOne({ email: req.body.email })
      if (user) {
        const areSame = await bcrypt.compare(value, user.password)
        if (!areSame) {
          return Promise.reject('Неправильный пароль')
        }
      }
    })
    .trim(),
]

exports.courseValidators = [
  body('title')
    .isLength({ min: 3 })
    .withMessage('Минимальная длина названия 3 символа')
    .trim(),
  body('price')
    .isNumeric()
    .withMessage('Введите корректрую цену'),
  body('img', 'Введите корректный Url картинки').isURL(),
]
