const express = require("express");
const app = express();
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const PORT = 8080;
const routesPath = path.join(__dirname, "routes");

app.use(
  cors({
    origin: "http://localhost:3000", // ✅ 프론트 주소 명시
    credentials: true, // ✅ 쿠키 인증 등 필요한 경우
  })
);

app.use(express.json());
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("DB 연결 성공!"))
  .catch(console.error);

fs.readdirSync(routesPath).forEach((file) => {
  if (file.endsWith(".js")) {
    const routeName = file.replace(".js", "");
    app.use(`/api/${routeName}`, require(path.join(routesPath, file)));
  }
});

app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.send(err.message || "서버에서 에러가 났습니다.");
});

app.use(express.static(path.join(__dirname, "../uploads")));

app.listen(PORT, () => {
  console.log(`PORT:${PORT}`);
});
