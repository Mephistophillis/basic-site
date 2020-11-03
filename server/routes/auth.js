const { Router } = require('express')
const bcrypt = require('bcryptjs')
const User = require('../models/user')
const router = Router()
const { validationResult } = require('express-validator')
const { loginValidators, registerValidators } = require('../utils/validators')
const nodemailer = require('nodemailer')
const smtpTransport = require('nodemailer-smtp-transport')

const { options, regEmail, resetEmail } = require('../emails')

const transporter = nodemailer.createTransport(smtpTransport(options))

const crypto = require('crypto')

router.get('/login', async (req, res) => {
  res.render('auth/login', {
    title: 'Log In',
    isLogin: true,
    loginError: req.flash('loginError'),
    registerError: req.flash('registerError'),
  })
})

router.get('/logout', async (req, res) => {
  req.session.destroy(() => {
    res.redirect('/auth/login#login')
  })
})

router.post('/login', loginValidators, async (req, res) => {
  try {
    const { email } = req.body

    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      req.flash('loginError', errors.array()[0].msg)
      return res.status(422).redirect('/auth/login#login')
    }

    const user = await User.findOne({ email })

    req.session.user = user
    req.session.isAuthentificated = true

    req.session.save(err => {
      if (err) throw err
      res.redirect('/')
    })

  } catch (err) {
    console.log(err)
  }
})

router.post('/register', registerValidators, async (req, res) => {
  try {
    const { email, name, password } = req.body

    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      req.flash('registerError', errors.array()[0].msg)
      return res.status(422).redirect('/auth/login#register')
    }

    const hasPassword = await bcrypt.hash(password, 10)
    const user = new User({
      email,
      name,
      password: hasPassword,
      cart: { items: [] },
    })
    await user.save()

    res.redirect('/auth/login#login')

    await transporter.sendMail(regEmail(email))
  } catch (err) {
    console.log(err)
  }
})

router.get('/reset', (req, res) => {
  res.render('auth/reset', {
    title: 'Horgot password',
    error: req.flash('error'),
  })
})

router.post('/reset', (req, res) => {
  const { email } = req.body
  try {
    crypto.randomBytes(32, async (err, buffer) => {
      if (err) {
        req.flash('error', 'Sorry somthing went wrong...')
        return res.redirect('/auth/reset')
      }

      const token = buffer.toString('hex')

      const candidate = await User.findOne({ email })

      if (candidate) {
        candidate.resetToken = token
        candidate.resetTokenExp = Date.now() + 60 * 60 * 1000

        await candidate.save()
        await transporter.sendMail(resetEmail(candidate.email, token))

        res.redirect('/auth/login')
      } else {
        req.flash('error', 'Email not found')
        res.redirect('/auth/reset')
      }
    })
  } catch (err) {
    console.log(err)
  }
})

router.get('/password/:token', async (req, res) => {
  const { token } = req.params
  if (!token) return res.redirect('/auth/login')

  try {
    const user = await User.findOne({
      resetToken: token,
      resetTokenExp: { $gt: Date.now() },
    })

    if (!user) return res.redirect('/auth/login')
    else
      res.render('auth/password', {
        title: 'Restore password',
        error: req.flash('error'),
        userId: user._id.toString(),
        token,
      })
  } catch (err) {
    console.log(err)
  }
})

router.post('/password/:token', async (req, res) => {
  const { userId, token, password } = req.body
  try {
    const user = await User.findOne({
      _id: userId,
      resetToken: token,
      resetTokenExp: { $gt: Date.now() },
    })

    if (user) {
      user.password = await bcrypt.hash(password, 10)
      user.resetToken = undefined
      user.resetTokenExp = undefined
      await user.save()
      res.redirect('/auth/login')
    } else {
      req.flash('loginError', 'Token expired')
      res.redirect('/auth/login')
    }
  } catch (err) {
    console.log(err)
  }
})
module.exports = router
