import express from "express";
import authRouter from "./routes/auth";
import expensesRouter from "./routes/expenses";

const app = express();
const PORT = 3000;

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Привіт! Сервер працює");
});

app.get("/ping", (req, res) => {
  res.json({ message: "pong" });
});

app.use("/auth", authRouter);
app.use("/expenses", expensesRouter);

app.listen(PORT, () => {
  console.log(`Сервер запущено: http://localhost:${PORT}`);
});