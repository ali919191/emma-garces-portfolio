import { neon } from "@neondatabase/serverless";
import { drizzle, type NeonHttpDatabase } from "drizzle-orm/neon-http";
import * as schema from "./schema";

let database: NeonHttpDatabase<typeof schema> | undefined;

export function getDb() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required. Copy .env.example to .env.local and connect a Neon database.");
  }
  if (!database) database = drizzle(neon(databaseUrl), { schema });
  return database;
}
