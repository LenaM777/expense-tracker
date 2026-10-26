import express from "express";

const app = express();
const PORT = 3000;

app.get("/", (req, res) => {
  res.send("Привіт! Сервер працює");
});

app.get("/ping", (req, res) => {
  res.json({ message: "pong" });
});

app.listen(PORT, () => {
  console.log(`Сервер запущено: http://localhost:${PORT}`);
});