const { User } = require("./../models/user");

const authenticate = async (req, res, next) => {
  try {
    const token = await req.header('x-auth');
    const user = await User.findByToken(token);
    if(user) {
      req.user = user;
      req.token = token;
      next();
    } else {
      return Promise.reject();
    }
  } catch (e) {
    res.status(401).send(e);
  }
};

module.exports = {authenticate};