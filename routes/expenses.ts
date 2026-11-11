import { Router } from "express";
import { prisma } from "../lib/prisma";
import { requireAuth } from "../middleware/requireAuth";
import { parseId, validateExpense } from "../validation";

const router = Router();

router.use(requireAuth);

function formatExpense<T extends { amount: { toNumber(): number } }>(
  expense: T
) {
  return { ...expense, amount: expense.amount.toNumber() };
}

router.get("/", async (req, res) => {
  const expenses = await prisma.expense.findMany({
    where: { userId: res.locals.userId },
    orderBy: { id: "asc" },
  });
  res.json(expenses.map(formatExpense));
});

router.get("/:id", async (req, res) => {
  const id = parseId(req.params.id);
  if (id === null) {
    return res.status(400).json({ message: "Invalid id" });
  }

  const expense = await prisma.expense.findFirst({
    where: { id, userId: res.locals.userId },
  });
  if (!expense) {
    return res.status(404).json({ message: "Expense not found" });
  }

  res.json(formatExpense(expense));
});

router.post("/", async (req, res) => {
  const error = validateExpense(req.body);
  if (error) {
    return res.status(400).json({ message: error });
  }

  const { title, amount, category } = req.body;
  const newExpense = await prisma.expense.create({
    data: { title, amount, category, userId: res.locals.userId },
  });

  res.status(201).json(formatExpense(newExpense));
});

router.put("/:id", async (req, res) => {
  const id = parseId(req.params.id);
  if (id === null) {
    return res.status(400).json({ message: "Invalid id" });
  }

  const expense = await prisma.expense.findFirst({
    where: { id, userId: res.locals.userId },
  });
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

router.delete("/:id", async (req, res) => {
  const id = parseId(req.params.id);
  if (id === null) {
    return res.status(400).json({ message: "Invalid id" });
  }

  const expense = await prisma.expense.findFirst({
    where: { id, userId: res.locals.userId },
  });
  if (!expense) {
    return res.status(404).json({ message: "Expense not found" });
  }

  await prisma.expense.delete({ where: { id } });
  res.status(204).send();
});

export default router;