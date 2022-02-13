const express = require("express");
const CreateError = require("http-errors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const gravatar = require("gravatar");
const Jimp = require("jimp");

const fs = require("fs/promises");
const path = require("path");

require("dotenv").config();

const { User, schemas } = require("../../models/user");
const { authenticate, upload } = require("../../middlewares");

const router = express.Router();

const { SECRET_KEY } = process.env;

const avatarsDir = path.join(__dirname, "../../", "public", "avatars");

router.post("/signup", async (req, res, next) => {
  try {
    const { error } = schemas.signup.validate(req.body);

    if (error) throw new CreateError(400, error.message);

    const salt = await bcrypt.genSalt(10);
    const hashedPass = await bcrypt.hash(req.body.password, salt);

    const user = await User.findOne({ email: req.body.email });

    if (user) throw new CreateError(409, "Email in use");

    const avatarURL = gravatar.url(req.body.email, { protocol: "http" });

    const { email, subscription } = await User.create({
      ...req.body,
      password: hashedPass,
      avatarURL,
    });

    res.status(201).json({ email, subscription });
  } catch (e) {
    next(e);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const { error } = schemas.login.validate(req.body);

    if (error) throw new CreateError(400, error.message);

    const user = await User.findOne({ email });

    if (!user) throw new CreateError(401, "Email or password is wrong");

    const compareResult = await bcrypt.compare(password, user.password);

    if (!compareResult)
      throw new CreateError(401, "Email or password is wrong");

    const payload = {
      id: user._id,
    };

    const token = jwt.sign(payload, SECRET_KEY, { expiresIn: "1h" });
    await User.findByIdAndUpdate(user._id, { token });
    res.json({
      user: { email: user.email, subscription: user.subscription },
      token,
    });
  } catch (e) {
    next(e);
  }
});

router.get("/logout", authenticate, async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.user.id, { token: "" });

    res.status(204).json();
  } catch (e) {
    next(e);
  }
});

router.get("/current", authenticate, (req, res, next) => {
  try {
    res.json({ email: req.user.email, subscription: req.user.subscription });
  } catch (e) {
    next(e);
  }
});

router.patch("/subscription", authenticate, async (req, res, next) => {
  try {
    const { error } = schemas.updateSubscription.validate(req.body);

    if (error) throw new CreateError(400, error.message);

    const { email, subscription } = await User.findByIdAndUpdate(
      req.user.id,
      req.body,
      {
        new: true,
      }
    );

    res.json({ email, subscription });
  } catch (e) {
    next(e);
  }
});

router.patch(
  "/avatars",
  upload.single("avatar"),
  authenticate,
  async (req, res, next) => {
    const { path: tmpDir, filename } = req.file;

    try {
      const avatar = await Jimp.read(tmpDir);
      avatar.cover(250, 250).write(tmpDir);

      const [extension] = filename.split(".").reverse();

      const newFilename = `${req.user._id}.${extension}`;
      const resultUpload = path.join(avatarsDir, newFilename);

      await fs.rename(tmpDir, resultUpload);

      const { avatarURL } = await User.findByIdAndUpdate(
        req.user.id,
        {
          avatarURL: path.join(avatarsDir, newFilename),
        },
        {
          new: true,
        }
      );
      res.json({ avatarURL });
    } catch (e) {
      await fs.unlink(tmpDir);
      next(e);
    }
  }
);

module.exports = router;
