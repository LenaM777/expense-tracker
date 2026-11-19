import { Router } from "express";
import { prisma } from "../lib/prisma";
import { requireAuth } from "../middleware/requireAuth";
import { parseId, parseMonth, validateExpense } from "../validation";

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

router.get("/summary", async (req, res) => {
  let range: ReturnType<typeof parseMonth> = null;

  if (req.query.month !== undefined && req.query.month !== "") {
    range = parseMonth(req.query.month);
    if (!range) {
      return res
        .status(400)
        .json({ message: "Invalid month, use format YYYY-MM" });
    }
  }

  const groups = await prisma.expense.groupBy({
    by: ["category"],
    where: {
      userId: res.locals.userId,
      ...(range ? { createdAt: { gte: range.start, lt: range.end } } : {}),
    },
    _sum: { amount: true },
    orderBy: { _sum: { amount: "desc" } },
  });

  const categories = groups.map((g) => ({
    category: g.category,
    total: g._sum.amount?.toNumber() ?? 0,
  }));
  const total = categories.reduce((sum, c) => sum + c.total, 0);

  res.json({ total: Math.round(total * 100) / 100, categories });
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