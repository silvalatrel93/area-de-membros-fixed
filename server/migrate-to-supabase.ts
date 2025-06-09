import { config } from 'dotenv';
config(); // Carregar variáveis de ambiente

import { supabaseAdmin } from './supabase';
import { db } from './db';
import { users, modules, lessons, progress } from '@shared/schema';

async function migrateToSupabase() {
  try {
    console.log('🔄 Migrating data to Supabase...');

    // 1. Criar tabelas no Supabase (você precisa fazer isso no SQL Editor do Supabase)
    console.log('📋 Please create tables in Supabase first using the SQL Editor');

    // 2. Migrar usuários
    console.log('👥 Migrating users...');
    const currentUsers = await db.select().from(users);

    for (const user of currentUsers) {
      const { data, error } = await supabaseAdmin
        .from('users')
        .insert({
          username: user.username,
          password: user.password,
          is_admin: user.isAdmin,
          created_at: user.createdAt
        });

      if (error) {
        console.error('Error migrating user:', error);
      } else {
        console.log(`✅ User ${user.username} migrated`);
      }
    }

    // 3. Migrar módulos
    console.log('📚 Migrating modules...');
    const currentModules = await db.select().from(modules);

    for (const module of currentModules) {
      const { data, error } = await supabaseAdmin
        .from('modules')
        .insert({
          title: module.title,
          description: module.description,
          image_url: module.imageUrl,
          materials_url: module.materialsUrl,
          order_index: module.orderIndex,
          is_active: module.isActive,
          created_at: module.createdAt
        });

      if (error) {
        console.error('Error migrating module:', error);
      } else {
        console.log(`✅ Module ${module.title} migrated`);
      }
    }

    // 4. Migrar lições
    console.log('🎥 Migrating lessons...');
    const currentLessons = await db.select().from(lessons);

    for (const lesson of currentLessons) {
      const { data, error } = await supabaseAdmin
        .from('lessons')
        .insert({
          module_id: lesson.moduleId,
          title: lesson.title,
          description: lesson.description,
          video_url: lesson.videoUrl,
          duration: lesson.duration,
          order_index: lesson.orderIndex,
          is_active: lesson.isActive,
          created_at: lesson.createdAt
        });

      if (error) {
        console.error('Error migrating lesson:', error);
      } else {
        console.log(`✅ Lesson ${lesson.title} migrated`);
      }
    }

    // 5. Migrar progresso
    console.log('📊 Migrating progress...');
    const currentProgress = await db.select().from(progress);

    for (const prog of currentProgress) {
      const { data, error } = await supabaseAdmin
        .from('progress')
        .insert({
          session_id: prog.sessionId,
          lesson_id: prog.lessonId,
          module_id: prog.moduleId,
          is_completed: prog.isCompleted,
          progress_percentage: prog.progressPercentage,
          last_watched_at: prog.lastWatchedAt
        });

      if (error) {
        console.error('Error migrating progress:', error);
      } else {
        console.log(`✅ Progress migrated`);
      }
    }

    console.log('✅ Migration completed successfully!');

  } catch (error) {
    console.error('❌ Migration failed:', error);
  }
}

// Execute if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  migrateToSupabase();
}

export { migrateToSupabase };