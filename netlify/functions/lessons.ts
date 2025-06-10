
import { Handler } from '@netlify/functions';
import { neon } from '@neondatabase/serverless';

// Database connection
const sql = neon(process.env.DATABASE_URL!);

// Database storage class
class DatabaseStorage {
  async getLessons(moduleId?: string) {
    if (moduleId) {
      const lessons = await sql`
        SELECT * FROM lessons 
        WHERE moduleId = ${parseInt(moduleId)}
        ORDER BY "order"
      `;
      return lessons;
    } else {
      const lessons = await sql`
        SELECT * FROM lessons
        ORDER BY moduleId, "order"
      `;
      return lessons;
    }
  }

  async createLesson(lessonData: any) {
    const { title, description, videoUrl, duration, moduleId, materialsUrl, order = 1 } = lessonData;
    const result = await sql`
      INSERT INTO lessons (title, description, videoUrl, duration, moduleId, materialsUrl, "order")
      VALUES (${title}, ${description}, ${videoUrl}, ${duration}, ${moduleId}, ${materialsUrl}, ${order})
      RETURNING *
    `;
    return result[0];
  }

  async updateLesson(id: number, lessonData: any) {
    const { title, description, videoUrl, duration, materialsUrl } = lessonData;
    const result = await sql`
      UPDATE lessons 
      SET title = ${title}, description = ${description}, videoUrl = ${videoUrl}, 
          duration = ${duration}, materialsUrl = ${materialsUrl}
      WHERE id = ${id}
      RETURNING *
    `;
    return result[0];
  }

  async deleteLesson(id: number) {
    await sql`DELETE FROM lessons WHERE id = ${id}`;
    return { success: true };
  }
}

const storage = new DatabaseStorage();

export const handler: Handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const url = new URL(`https://example.com${event.path}`);
    const pathParts = event.path.split('/').filter(Boolean);
    const lessonId = pathParts[pathParts.length - 1];
    const moduleId = url.searchParams.get('moduleId');

    if (event.httpMethod === 'GET') {
      const lessons = await storage.getLessons(moduleId || undefined);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(lessons)
      };
    }

    if (event.httpMethod === 'POST') {
      const lessonData = JSON.parse(event.body || '{}');
      const lesson = await storage.createLesson(lessonData);
      return {
        statusCode: 201,
        headers,
        body: JSON.stringify(lesson)
      };
    }

    if (event.httpMethod === 'PUT' && lessonId && !isNaN(parseInt(lessonId))) {
      const lessonData = JSON.parse(event.body || '{}');
      const lesson = await storage.updateLesson(parseInt(lessonId), lessonData);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(lesson)
      };
    }

    if (event.httpMethod === 'DELETE' && lessonId && !isNaN(parseInt(lessonId))) {
      const result = await storage.deleteLesson(parseInt(lessonId));
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(result)
      };
    }

    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  } catch (error) {
    console.error('Lessons error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      })
    };
  }
};
