module.exports = {
  service: `gmail`,
  host: `smtp.gmail.com`,
  auth: {
    user: process.env.MAILER_USER,
    pass: process.env.MAILER_PASS,
  },
}
