import express from "express";
import { prisma } from "./lib/prisma";
import bcrypt from "bcryptjs";

const app = express();
const PORT = 3000;

app.use(express.json());

type ExpenseInput = {
  title?: unknown;
  amount?: unknown;
  category?: unknown;
};

function validateExpense(body: ExpenseInput = {}): string | null {
  const { title, amount, category } = body;

  if (typeof title !== "string" || title.trim() === "") {
    return "Title is required";
  }
  if (typeof amount !== "number" || amount <= 0) {
    return "Amount must be a positive number";
  }
  if (typeof category !== "string" || category.trim() === "") {
    return "Category is required";
  }

  return null;
}

function formatExpense<T extends { amount: { toNumber(): number } }>(
  expense: T
) {
  return { ...expense, amount: expense.amount.toNumber() };
}

function parseId(value: string): number | null {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

app.get("/", (req, res) => {
  res.send("Привіт! Сервер працює");
});

app.get("/ping", (req, res) => {
  res.json({ message: "pong" });
});

app.get("/expenses", async (req, res) => {
  const expenses = await prisma.expense.findMany({ orderBy: { id: "asc" } });
  res.json(expenses.map(formatExpense));
});

app.get("/expenses/:id", async (req, res) => {
  const id = parseId(req.params.id);
if (id === null) {
  return res.status(400).json({ message: "Invalid id" });
}
  const expense = await prisma.expense.findUnique({ where: { id } });

  if (!expense) {
    return res.status(404).json({ message: "Expense not found" });
  }

  res.json(formatExpense(expense));
});

app.post("/expenses", async (req, res) => {
  const error = validateExpense(req.body);
  if (error) {
    return res.status(400).json({ message: error });
  }

  const { title, amount, category } = req.body;
  const newExpense = await prisma.expense.create({
    data: { title, amount, category },
  });

  res.status(201).json(formatExpense(newExpense));
});

app.put("/expenses/:id", async (req, res) => {
  const id = parseId(req.params.id);
if (id === null) {
  return res.status(400).json({ message: "Invalid id" });
}
  const expense = await prisma.expense.findUnique({ where: { id } });

  if (!expense) {
    return res.status(404).json({ message: "Expense not found" });
  }

  const error = validateExpense(req.body);
  if (error) {
    return res.status(400).json({ message: error });
  }

  const { title, amount, category } = req.body;
  const updated = await prisma.expense.update({
    where: { id },
    data: { title, amount, category },
  });

  res.json(formatExpense(updated));
});

app.delete("/expenses/:id", async (req, res) => {
  const id = parseId(req.params.id);
if (id === null) {
  return res.status(400).json({ message: "Invalid id" });
}
  const expense = await prisma.expense.findUnique({ where: { id } });

  if (!expense) {
    return res.status(404).json({ message: "Expense not found" });
  }

  await prisma.expense.delete({ where: { id } });
  res.status(204).send();
});

app.post("/auth/register", async (req, res) => {
  const { email, password } = req.body ?? {};

  if (typeof email !== "string" || !email.includes("@")) {
    return res.status(400).json({ message: "Valid email is required" });
  }
  if (typeof password !== "string" || password.length < 8) {
    return res
      .status(400)
      .json({ message: "Password must be at least 8 characters" });
  }

  const normalizedEmail = email.trim().toLowerCase();

  const existing = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });
  if (existing) {
    return res.status(409).json({ message: "Email already registered" });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: { email: normalizedEmail, passwordHash },
  });

  res.status(201).json({ id: user.id, email: user.email });
});

app.listen(PORT, () => {
  console.log(`Сервер запущено: http://localhost:${PORT}`);
});