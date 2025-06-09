
import { db } from "./db";
import { modules } from "@shared/schema";

async function testDatabase() {
  try {
    console.log("Testing database connection...");
    const result = await db.select().from(modules).limit(1);
    console.log("Database connection successful!");
    console.log("Sample data:", result);
  } catch (error) {
    console.error("Database connection failed:", error);
  }
}

testDatabase();
