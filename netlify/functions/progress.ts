
import { Handler } from '@netlify/functions';
import { neon } from '@neondatabase/serverless';

// Database connection
const sql = neon(process.env.DATABASE_URL!);

// Database storage class
class DatabaseStorage {
  async getProgress(sessionId: string) {
    const progress = await sql`
      SELECT * FROM user_progress 
      WHERE sessionId = ${sessionId}
    `;
    return progress;
  }

  async updateProgress(progressData: any) {
    const { sessionId, lessonId, moduleId, completed = false, currentTime = 0 } = progressData;
    
    // Try to update existing progress
    const existingProgress = await sql`
      SELECT * FROM user_progress 
      WHERE sessionId = ${sessionId} AND lessonId = ${lessonId}
    `;

    if (existingProgress.length > 0) {
      const result = await sql`
        UPDATE user_progress 
        SET completed = ${completed}, currentTime = ${currentTime}, updatedAt = NOW()
        WHERE sessionId = ${sessionId} AND lessonId = ${lessonId}
        RETURNING *
      `;
      return result[0];
    } else {
      const result = await sql`
        INSERT INTO user_progress (sessionId, lessonId, moduleId, completed, currentTime)
        VALUES (${sessionId}, ${lessonId}, ${moduleId}, ${completed}, ${currentTime})
        RETURNING *
      `;
      return result[0];
    }
  }

  async markLessonComplete(sessionId: string, lessonId: number, moduleId: number) {
    const result = await sql`
      INSERT INTO user_progress (sessionId, lessonId, moduleId, completed, currentTime)
      VALUES (${sessionId}, ${lessonId}, ${moduleId}, true, 0)
      ON CONFLICT (sessionId, lessonId)
      DO UPDATE SET completed = true, updatedAt = NOW()
      RETURNING *
    `;
    return result[0];
  }
}

const storage = new DatabaseStorage();

export const handler: Handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const url = new URL(`https://example.com${event.path}`);
    const sessionId = url.searchParams.get('sessionId');

    if (event.httpMethod === 'GET' && sessionId) {
      const progress = await storage.getProgress(sessionId);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(progress)
      };
    }

    if (event.httpMethod === 'POST') {
      const progressData = JSON.parse(event.body || '{}');
      const progress = await storage.updateProgress(progressData);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(progress)
      };
    }

    if (event.httpMethod === 'PUT') {
      const { sessionId, lessonId, moduleId } = JSON.parse(event.body || '{}');
      const progress = await storage.markLessonComplete(sessionId, lessonId, moduleId);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(progress)
      };
    }

    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Missing required parameters' })
    };
  } catch (error) {
    console.error('Progress error:', error);
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
