module.exports = (email, token )=> ({
  to: email,
  from: process.env.EMAIL_FROM,
  subject: 'Reset password',
  html: `
    <h1>Forgot passwort?</h1>
    <hr />
    <p>if you are:</p>
    <p><a href="${process.env.BASE_URL}/auth/password/${token}">reset password</a></p>
  `,
})
