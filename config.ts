import "dotenv/config";

const secret = process.env.JWT_SECRET;
if (!secret) {
  throw new Error("JWT_SECRET is not set in .env");
}

export const JWT_SECRET: string = secret;