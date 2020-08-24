module.exports = (req, res, next) => {
  if (!req.session.isAuthentificated) return res.redirect("/auth/login");
  next();
};
