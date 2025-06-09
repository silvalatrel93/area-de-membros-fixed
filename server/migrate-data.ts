import { config } from 'dotenv';
config();

import { Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import pg from 'pg';
import { drizzle as drizzleNode } from 'drizzle-orm/node-postgres';
import ws from "ws";
import * as schema from '@shared/schema';

// Configure WebSocket for Neon
// @ts-ignore
globalThis.WebSocket = ws;

const { Pool: PgPool } = pg;

async function migrateData() {
  try {
    console.log('🔄 Starting data migration to Supabase...');

    // Connect to old PostgreSQL database
    const oldPool = new Pool({ connectionString: process.env.DATABASE_URL });
    const oldDb = drizzle({ client: oldPool, schema });

    // Connect to Supabase
    const newPool = new PgPool({ connectionString: process.env.SUPABASE_DATABASE_URL });
    const newDb = drizzleNode(newPool, { schema });

    // 1. Migrate users
    console.log('👥 Migrating users...');
    const users = await oldDb.select().from(schema.users);
    for (const user of users) {
      await newDb.insert(schema.users).values({
        username: user.username,
        password: user.password,
        isAdmin: user.isAdmin,
        createdAt: user.createdAt
      }).onConflictDoNothing();
      console.log(`✅ User ${user.username} migrated`);
    }

    // 2. Migrate modules
    console.log('📚 Migrating modules...');
    const modules = await oldDb.select().from(schema.modules);
    for (const module of modules) {
      await newDb.insert(schema.modules).values({
        title: module.title,
        description: module.description,
        imageUrl: module.imageUrl,
        materialsUrl: module.materialsUrl,
        orderIndex: module.orderIndex,
        isActive: module.isActive,
        createdAt: module.createdAt
      }).onConflictDoNothing();
      console.log(`✅ Module ${module.title} migrated`);
    }

    // 3. Migrate lessons
    console.log('🎥 Migrating lessons...');
    const lessons = await oldDb.select().from(schema.lessons);
    for (const lesson of lessons) {
      await newDb.insert(schema.lessons).values({
        moduleId: lesson.moduleId,
        title: lesson.title,
        description: lesson.description,
        videoUrl: lesson.videoUrl,
        duration: lesson.duration,
        orderIndex: lesson.orderIndex,
        isActive: lesson.isActive,
        createdAt: lesson.createdAt
      }).onConflictDoNothing();
      console.log(`✅ Lesson ${lesson.title} migrated`);
    }

    // 4. Migrate progress
    console.log('📊 Migrating progress...');
    const progress = await oldDb.select().from(schema.progress);
    for (const prog of progress) {
      await newDb.insert(schema.progress).values({
        sessionId: prog.sessionId,
        lessonId: prog.lessonId,
        moduleId: prog.moduleId,
        isCompleted: prog.isCompleted,
        progressPercentage: prog.progressPercentage,
        lastWatchedAt: prog.lastWatchedAt
      }).onConflictDoNothing();
      console.log(`✅ Progress record migrated`);
    }

    console.log('✅ Migration completed successfully!');
    console.log('🎯 All data has been transferred to Supabase');

    // Close connections
    await oldPool.end();
    await newPool.end();

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}

// Execute if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  migrateData().catch(console.error);
}

export { migrateData };