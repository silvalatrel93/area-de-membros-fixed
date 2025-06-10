import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import 'dotenv/config';
import * as schema from '../shared/schema';

async function seedDatabase() {
  if (!process.env.DATABASE_URL) {
    console.error("❌ Error: DATABASE_URL must be set");
    process.exit(1);
  }

  console.log('🌱 Seeding database...');
  
  const client = postgres(process.env.DATABASE_URL);
  const db = drizzle(client, { schema });
  
  try {
    // Insert modules
    const modules = await db.insert(schema.modules).values([
      {
        title: 'Fundamentos de Programação',
        description: 'Aprenda os conceitos básicos da programação',
        imageUrl: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=500',
        orderIndex: 1,
        isActive: true
      },
      {
        title: 'Desenvolvimento Web',
        description: 'HTML, CSS, JavaScript e frameworks modernos',
        imageUrl: 'https://images.unsplash.com/photo-1547658719-da2b51169166?w=500',
        orderIndex: 2,
        isActive: true
      },
      {
        title: 'Banco de Dados',
        description: 'SQL, PostgreSQL e design de banco de dados',
        imageUrl: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=500',
        orderIndex: 3,
        isActive: true
      },
      {
        title: 'DevOps e Deploy',
        description: 'Git, CI/CD e deployment de aplicações',
        imageUrl: 'https://images.unsplash.com/photo-1618477388954-7852f32655ec?w=500',
        orderIndex: 4,
        isActive: true
      }
    ]).returning();

    console.log('✅ Modules inserted:', modules.length);

    // Insert lessons for each module
    for (const module of modules) {
      const lessons = await db.insert(schema.lessons).values([
        {
          moduleId: module.id,
          title: 'Introdução ao Módulo',
          description: `Visão geral do módulo ${module.title}`,
          videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
          duration: 480,
          orderIndex: 1,
          isActive: true
        },
        {
          moduleId: module.id,
          title: 'Conceitos Básicos',
          description: `Fundamentos de ${module.title}`,
          videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
          duration: 720,
          orderIndex: 2,
          isActive: true
        },
        {
          moduleId: module.id,
          title: 'Práticas Avançadas',
          description: `Técnicas avançadas de ${module.title}`,
          videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
          duration: 900,
          orderIndex: 3,
          isActive: true
        }
      ]).returning();

      console.log(`✅ Lessons inserted for module ${module.title}:`, lessons.length);
    }

    console.log('🎉 Database seeding completed successfully!');
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase().catch(error => {
    console.error('❌ Unhandled error:', error);
    process.exit(1);
  });
}

export { seedDatabase }; 