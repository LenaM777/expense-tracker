import express from "express";

const app = express();
app.use(express.json());
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

app.post("/expenses", (req, res) => {
  const { title, amount, category } = req.body;

  const newExpense = {
    id: expenses.length + 1,
    title,
    amount,
    category,
  };

  expenses.push(newExpense);
  res.status(201).json(newExpense);
});

app.listen(PORT, () => {
  console.log(`Сервер запущено: http://localhost:${PORT}`);
});