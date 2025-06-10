import type { Context } from "@netlify/functions";
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "../../shared/schema";
import { DatabaseStorage } from "../../server/storage";
import session from 'express-session';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import bcrypt from 'bcrypt';

// Database connection
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL must be set");
}

const pool = new Pool({ 
  connectionString,
  ssl: { rejectUnauthorized: false }
});
const db = drizzle(pool, { schema });
const storage = new DatabaseStorage();

// Passport configuration
passport.use(new LocalStrategy(
  { usernameField: 'email' },
  async (email: string, password: string, done) => {
    try {
      const user = await storage.getUserByUsername(email);
      if (!user) {
        return done(null, false, { message: 'Credenciais inválidas' });
      }

      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        return done(null, false, { message: 'Credenciais inválidas' });
      }

      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }
));

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: number, done) => {
  try {
    const user = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.id, id)
    });
    done(null, user);
  } catch (error) {
    done(error);
  }
});

// Helper function to handle API routes
async function handleRoute(event: any, context: Context) {
  const { path, httpMethod, body, headers } = event;
  const url = new URL(`https://example.com${path}`);
  const pathname = url.pathname.replace('/.netlify/functions/api', '');

  // Parse request body
  let requestBody;
  try {
    requestBody = body ? JSON.parse(body) : {};
  } catch {
    requestBody = {};
  }

  // Mock session for serverless environment
  const sessionData = {
    passport: {},
    user: null
  };

  try {
    // Route handling
    switch (pathname) {
      case '/login':
        if (httpMethod === 'POST') {
          const { email, password } = requestBody;
          const user = await storage.getUserByUsername(email);
          
          if (!user || !await bcrypt.compare(password, user.password)) {
            return {
              statusCode: 401,
              body: JSON.stringify({
                success: false,
                message: 'Credenciais inválidas'
              })
            };
          }

          // Generate session ID (simplified for serverless)
          const sessionId = `session_${user.id}_${Date.now()}`;
          
          return {
            statusCode: 200,
            headers: {
              'Set-Cookie': `sessionId=${sessionId}; Path=/; HttpOnly; SameSite=Strict`
            },
            body: JSON.stringify({
              success: true,
              isAdmin: user.isAdmin,
              sessionId,
              message: 'Login realizado com sucesso!'
            })
          };
        }
        break;

      case '/modules':
        if (httpMethod === 'GET') {
          const modules = await storage.getModules();
          return {
            statusCode: 200,
            body: JSON.stringify(modules)
          };
        }
        
        if (httpMethod === 'POST') {
          const module = await storage.createModule(requestBody);
          return {
            statusCode: 201,
            body: JSON.stringify(module)
          };
        }
        break;

      case '/lessons':
        if (httpMethod === 'POST') {
          const lesson = await storage.createLesson(requestBody);
          return {
            statusCode: 201,
            body: JSON.stringify(lesson)
          };
        }
        break;

      default:
        // Handle progress routes
        if (pathname.startsWith('/progress')) {
          const urlParams = new URLSearchParams(url.search);
          const sessionId = urlParams.get('sessionId');
          
          if (httpMethod === 'GET' && sessionId) {
            const progress = await storage.getProgress(sessionId);
            return {
              statusCode: 200,
              body: JSON.stringify(progress)
            };
          }
          
          if (httpMethod === 'POST') {
            const progress = await storage.updateProgress(requestBody);
            return {
              statusCode: 200,
              body: JSON.stringify(progress)
            };
          }
          
          if (httpMethod === 'PUT') {
            const { sessionId, lessonId, moduleId } = requestBody;
            const progress = await storage.markLessonComplete(sessionId, lessonId, moduleId);
            return {
              statusCode: 200,
              body: JSON.stringify(progress)
            };
          }
        }
        
        return {
          statusCode: 404,
          body: JSON.stringify({ error: 'Route not found' })
        };
    }
  } catch (error) {
    console.error('API Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      })
    };
  }

  return {
    statusCode: 404,
    body: JSON.stringify({ error: 'Route not found' })
  };
}

export const handler = async (event: any, context: Context) => {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    const response = await handleRoute(event, context);
    return {
      ...response,
      headers: {
        ...headers,
        ...response.headers
      }
    };
  } catch (error) {
    console.error('Handler Error:', error);
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