import { defineConfig } from "drizzle-kit";
import path from "path";
import dotenv from "dotenv";

const envPath = path.resolve(__dirname, "../../.env");

dotenv.config({
  path: envPath,
});

if (!process.env.DATABASE_URL) {
  throw new Error(
    `DATABASE_URL not found. Expected .env at: ${envPath}`
  );
}

export default defineConfig({
  schema: "./src/schema/index.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});