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

export function parseMonth(value: unknown): { start: Date; end: Date } | null {
  if (typeof value !== "string" || !/^\d{4}-(0[1-9]|1[0-2])$/.test(value)) {
    return null;
  }
  const [year, month] = value.split("-").map(Number);
  return {
    start: new Date(Date.UTC(year, month - 1, 1)),
    end: new Date(Date.UTC(year, month, 1)),
  };
}