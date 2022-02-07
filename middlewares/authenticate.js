const CreateError = require("http-errors");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const { User } = require("../models/user");

const { SECRET_KEY } = process.env;

const authenticate = async (req, res, next) => {
  try {
    const { authorization } = req.headers;

    if (!authorization) throw new CreateError(401, "Not authorized");

    const [bearer, token] = authorization.split(" ");

    if (bearer !== "Bearer") throw new CreateError(401, "Not authorized");

    const { id } = jwt.verify(token, SECRET_KEY);

    const user = await User.findById(id);

    if (!user) throw new CreateError(401, "Not authorized");

    req.user = user;
    next();
  } catch (e) {
    if (!e.status) {
      e.status = 401;
      e.message = "Not authorized";
    }
    next(e);
  }
};

module.exports = authenticate;
