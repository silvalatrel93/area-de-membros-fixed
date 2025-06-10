
import { Handler } from '@netlify/functions';

export const handler: Handler = async (event, context) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  try {
    if (event.httpMethod === 'POST') {
      const body = JSON.parse(event.body || '{}');
      const { email, password } = body;

      // Validar entrada
      if (!email || !password) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ 
            success: false,
            message: "Email e senha são obrigatórios" 
          }),
        };
      }

      // Verificar credenciais
      const validEmail = process.env.STUDENT_EMAIL || "aluno@exemplo.com";
      const validPassword = process.env.STUDENT_PASSWORD || "123456";
      const adminEmail = process.env.ADMIN_EMAIL || "admin@exemplo.com";
      const adminPassword = process.env.ADMIN_PASSWORD || "admin123";

      let isAdmin = false;
      let isValid = false;

      if (email === validEmail && password === validPassword) {
        isValid = true;
      } else if (email === adminEmail && password === adminPassword) {
        isValid = true;
        isAdmin = true;
      }

      if (!isValid) {
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({ 
            success: false,
            message: "Credenciais inválidas" 
          }),
        };
      }

      // Gerar session ID
      const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          isAdmin,
          sessionId,
          message: "Login realizado com sucesso"
        }),
      };
    }

    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ message: 'Método não permitido' }),
    };

  } catch (error) {
    console.error('Auth error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        success: false,
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
    };
  }
};
