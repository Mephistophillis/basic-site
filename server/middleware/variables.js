module.exports = (req, res, next) => {
  res.locals.isAuth = req.session.isAuthentificated;
  res.locals.csrf = req.csrfToken();

  next();
};
