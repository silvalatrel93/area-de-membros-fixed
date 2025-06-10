import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import cors from 'cors';
import { config } from 'dotenv';
import { initDatabase } from './db';

// Carrega as variáveis de ambiente
config();

const app = express();

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://seu-dominio.com'] 
    : ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({
    message: 'Erro interno do servidor',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

// Função principal para iniciar o servidor
async function startServer() {
  try {
    // Inicializa o banco de dados
    await initDatabase();
    console.log('Banco de dados inicializado com sucesso!');

    // Registra as rotas
    await registerRoutes(app);

    // Define a porta
    const port = Number(process.env.PORT) || 5001;

    // Inicia o servidor
    app.listen(port, '0.0.0.0', () => {
      console.log(`[express] Server running at http://localhost:${port}`);
      console.log('[express] Available on:');
      console.log(`[express]   - http://localhost:${port}`);
      console.log(`[express]   - http://127.0.0.1:${port}`);
    });
  } catch (error) {
    console.error('Erro fatal ao iniciar o servidor:', error);
    process.exit(1);
  }
}

// Inicia o servidor
startServer();