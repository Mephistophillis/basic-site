module.exports = email => ({
  to: email,
  from: process.env.EMAIL_FROM,
  subject: 'Sing Up is complete',
  html: `
    <h1>Welcome to our market!</h1>
    <p>Accaunt sussfully registred!</p>
    <hr />
    <p>${email}</p>
    <hr />
    <a href="${process.env.BASE_URL}">Courses shop</a>
  `,
})
