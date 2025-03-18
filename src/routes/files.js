const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const AWS = require("aws-sdk");
const multer = require("multer");
const multerS3 = require("multer-s3");
const { v4: uuidv4 } = require("uuid");

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const uploadS3 = multer({
  storage: multerS3({
    s3,
    bucket: process.env.AWS_S3_BUCKET_NAME,
    metadata: (_, file, cb) => {
      cb(null, { fieldName: file.fieldname });
    },
    key: (_, file, cb) => {
      const fileExtension = file.originalname.split(".").pop();
      cb(null, `uploads/${uuidv4()}.${fileExtension}`);
    },
  }),
});

router.post("/upload", auth, uploadS3.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "파일 업로드 실패" });
  }
  const { location, originalname, size } = req.file;
  res.json({
    location,
    originalname: decodeURIComponent(originalname),
    size,
  });
});

router.post("/uploads", auth, uploadS3.array("file", 10), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ message: "파일 업로드 실패" });
  }
  const { location: locations, originalname, size } = req.file;
  res.json({
    locations,
    originalname,
    size,
  });
});

module.exports = router;
