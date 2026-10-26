import express from "express";

const app = express();
const PORT = 3000;

const expenses = [
  { id: 1, title: "Кава", amount: 85, category: "food" },
  { id: 2, title: "Метро", amount: 20, category: "transport" },
];

app.get("/", (req, res) => {
  res.send("Привіт! Сервер працює");
});

app.get("/ping", (req, res) => {
  res.json({ message: "pong" });
});

app.get("/expenses", (req, res) => {
  res.json(expenses);
});

app.listen(PORT, () => {
  console.log(`Сервер запущено: http://localhost:${PORT}`);
});