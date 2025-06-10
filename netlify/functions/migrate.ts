
import { Handler } from '@netlify/functions';
import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcrypt';

// Database connection
const sql = neon(process.env.DATABASE_URL!);

export const handler: Handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // Create tables
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        isAdmin BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS modules (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        "order" INTEGER DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS lessons (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        videoUrl VARCHAR(500),
        duration INTEGER DEFAULT 0,
        moduleId INTEGER REFERENCES modules(id) ON DELETE CASCADE,
        materialsUrl VARCHAR(500),
        "order" INTEGER DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS user_progress (
        id SERIAL PRIMARY KEY,
        sessionId VARCHAR(255) NOT NULL,
        lessonId INTEGER REFERENCES lessons(id) ON DELETE CASCADE,
        moduleId INTEGER REFERENCES modules(id) ON DELETE CASCADE,
        completed BOOLEAN DEFAULT false,
        currentTime INTEGER DEFAULT 0,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(sessionId, lessonId)
      )
    `;

    // Create default users
    const adminPassword = await bcrypt.hash('admin123', 10);
    const studentPassword = await bcrypt.hash('123456', 10);

    await sql`
      INSERT INTO users (email, password, isAdmin)
      VALUES ('admin@admin.com', ${adminPassword}, true)
      ON CONFLICT (email) DO NOTHING
    `;

    await sql`
      INSERT INTO users (email, password, isAdmin)
      VALUES ('aluno@aluno.com', ${studentPassword}, false)
      ON CONFLICT (email) DO NOTHING
    `;

    // Create sample module
    const moduleResult = await sql`
      INSERT INTO modules (title, description, "order")
      VALUES ('Módulo Introdutório', 'Aprenda os conceitos básicos', 1)
      ON CONFLICT DO NOTHING
      RETURNING id
    `;

    if (moduleResult.length > 0) {
      const moduleId = moduleResult[0].id;
      
      await sql`
        INSERT INTO lessons (title, description, videoUrl, duration, moduleId, "order")
        VALUES 
          ('Aula 1: Introdução', 'Primeira aula do curso', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 300, ${moduleId}, 1),
          ('Aula 2: Conceitos Básicos', 'Segunda aula do curso', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 450, ${moduleId}, 2)
        ON CONFLICT DO NOTHING
      `;
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Banco de dados configurado com sucesso!'
      })
    };

  } catch (error) {
    console.error('Migration error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        message: 'Erro na migração do banco de dados',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    };
  }
};
