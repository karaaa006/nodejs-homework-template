const CreateError = require("http-errors");
const multer = require("multer");

const multerConfig = multer.diskStorage({
  destination: "tmp/",
  filename: (req, file, cb) => {
    console.log(file.mimetype);
    if (
      file.mimetype === "image/png" ||
      file.mimetype === "image/jpg" ||
      file.mimetype === "image/jpeg"
    ) {
      cb(null, file.originalname);
    } else {
      cb(
        new CreateError(
          400,
          "Доступные форматы для загрузки: PNG, JPG или JPEG"
        )
      );
    }
  },
});

const upload = multer({
  storage: multerConfig,
});

module.exports = upload;
