import type { Handler } from "@netlify/functions";
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { eq } from 'drizzle-orm';
import * as schema from "../../shared/schema";
import bcrypt from 'bcrypt';

const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});
const db = drizzle(pool, { schema });

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
    const { email, password } = JSON.parse(event.body || '{}');

    const user = await db.query.users.findFirst({
      where: eq(schema.users.username, email)
    });

    if (!user || !await bcrypt.compare(password, user.password)) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({
          success: false,
          message: 'Credenciais inválidas'
        })
      };
    }

    const sessionId = `session_${user.id}_${Date.now()}`;
    
    return {
      statusCode: 200,
      headers: {
        ...headers,
        'Set-Cookie': `sessionId=${sessionId}; Path=/; HttpOnly; SameSite=Strict`
      },
      body: JSON.stringify({
        success: true,
        isAdmin: user.isAdmin,
        sessionId,
        message: 'Login realizado com sucesso!'
      })
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