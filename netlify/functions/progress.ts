import type { Handler } from "@netlify/functions";
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "../../shared/schema";
import { DatabaseStorage } from "../../server/storage";

const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});
const db = drizzle(pool, { schema });
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
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  } catch (error) {
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