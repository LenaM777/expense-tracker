import express from "express";

const app = express();
const PORT = 3000;

app.get("/", (req, res) => {
  res.send("Привіт! Сервер працює");
});

app.listen(PORT, () => {
  console.log(`Сервер запущено: http://localhost:${PORT}`);
});