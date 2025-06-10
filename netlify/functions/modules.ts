
import { Handler } from '@netlify/functions';
import { neon } from '@neondatabase/serverless';

// Database connection
const sql = neon(process.env.DATABASE_URL!);

// Database storage class
class DatabaseStorage {
  async getModules() {
    const modules = await sql`
      SELECT 
        m.*,
        COALESCE(
          json_agg(
            json_build_object(
              'id', l.id,
              'title', l.title,
              'description', l.description,
              'videoUrl', l.videoUrl,
              'duration', l.duration,
              'materialsUrl', l.materialsUrl,
              'order', l."order"
            ) ORDER BY l."order"
          ) FILTER (WHERE l.id IS NOT NULL), 
          '[]'::json
        ) as lessons
      FROM modules m
      LEFT JOIN lessons l ON m.id = l.moduleId
      GROUP BY m.id
      ORDER BY m."order"
    `;
    return modules;
  }

  async createModule(moduleData: any) {
    const { title, description, order = 1 } = moduleData;
    const result = await sql`
      INSERT INTO modules (title, description, "order")
      VALUES (${title}, ${description}, ${order})
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
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    if (event.httpMethod === 'GET') {
      const modules = await storage.getModules();
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(modules)
      };
    }

    if (event.httpMethod === 'POST') {
      const moduleData = JSON.parse(event.body || '{}');
      const module = await storage.createModule(moduleData);
      return {
        statusCode: 201,
        headers,
        body: JSON.stringify(module)
      };
    }

    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  } catch (error) {
    console.error('Modules error:', error);
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
