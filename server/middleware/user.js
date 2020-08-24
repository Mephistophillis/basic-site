const User = require("../models/user");

module.exports = async (req, res, next) => {
  if (!req.session.user) return next();

  req.user = await User.find(req.session.user._id);
  next();
};
