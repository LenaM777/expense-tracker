type ExpenseInput = {
  title?: unknown;
  amount?: unknown;
  category?: unknown;
};

export function validateExpense(body: ExpenseInput = {}): string | null {
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

export function parseId(value: unknown): number | null {
  if (typeof value !== "string") return null;
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}