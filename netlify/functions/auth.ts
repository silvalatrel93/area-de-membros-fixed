
import { Handler } from '@netlify/functions';
import bcrypt from 'bcrypt';
import { neon } from '@neondatabase/serverless';

// Database connection
const sql = neon(process.env.DATABASE_URL!);

// Database storage class
class DatabaseStorage {
  async getUserByUsername(email: string) {
    const result = await sql`
      SELECT id, email, password, isAdmin, created_at 
      FROM users 
      WHERE email = ${email}
    `;
    return result[0] || null;
  }

  async createUser(email: string, password: string, isAdmin: boolean = false) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await sql`
      INSERT INTO users (email, password, isAdmin)
      VALUES (${email}, ${hashedPassword}, ${isAdmin})
      RETURNING id, email, isAdmin, created_at
    `;
    return result[0];
  }
}

const storage = new DatabaseStorage();

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

    if (!email || !password) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          message: 'Email e senha são obrigatórios'
        })
      };
    }

    // Try to find user
    let user = await storage.getUserByUsername(email);

    // If user doesn't exist, create default users
    if (!user) {
      // Create admin user if logging in as admin
      if (email === 'admin@admin.com' && password === 'admin123') {
        user = await storage.createUser(email, password, true);
      }
      // Create student user if logging in as student
      else if (email === 'aluno@aluno.com' && password === '123456') {
        user = await storage.createUser(email, password, false);
      }
      else {
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({
            success: false,
            message: 'Credenciais inválidas'
          })
        };
      }
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({
          success: false,
          message: 'Credenciais inválidas'
        })
      };
    }

    // Generate session ID
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        sessionId,
        isAdmin: user.isAdmin || false,
        message: 'Login realizado com sucesso'
      })
    };

  } catch (error) {
    console.error('Auth error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        message: 'Erro interno do servidor'
      })
    };
  }
};
