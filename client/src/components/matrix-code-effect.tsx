import { useEffect, useRef } from "react";

interface MatrixCodeEffectProps {
  className?: string;
  speed?: number;
}

export default function MatrixCodeEffect({ className = '', speed = 50 }: MatrixCodeEffectProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Programming code snippets
    const codeSnippets = [
      'function()',
      'const x =',
      'if (true)',
      'return;',
      'import',
      'export',
      'async',
      'await',
      'class',
      'extends',
      'let data',
      'npm run',
      'git push',
      'console.log',
      'useState',
      'useEffect',
      'props =>',
      '{ ... }',
      'map(()',
      'filter(',
      'reduce(',
      'forEach',
      'Promise',
      'then()',
      'catch()',
      'finally',
      'try {',
      'catch (e)',
      'throw new',
      'Error(',
      'JSON.parse',
      'stringify',
      'setTimeout',
      'setInterval',
      'clearTimeout',
      'addEventListener',
      'querySelector',
      'getElementById',
      'createElement',
      'appendChild',
      'innerHTML',
      'textContent',
      'style.color',
      'classList.add',
      'dataset.',
      'localStorage',
      'sessionStorage',
      'fetch()',
      'response.json',
      'status: 200',
      'method: POST',
      'headers: {',
      'Content-Type',
      'Authorization',
      'Bearer token',
      'API_KEY',
      'process.env',
      'NODE_ENV',
      'PORT: 3000',
      'server.listen',
      'app.get(',
      'req.body',
      'res.send(',
      'res.json(',
      'middleware',
      'next()',
      'router.use',
      'express()',
      'cors()',
      'helmet()',
      'bodyParser',
      'mongoose',
      'Schema',
      'model(',
      'find()',
      'findOne',
      'findById',
      'save()',
      'update()',
      'delete()',
      'populate',
      'aggregate',
      'pipeline',
      'match: {',
      'group: {',
      'sort: {',
      'limit: 10',
      'skip: 0',
      'SELECT *',
      'FROM users',
      'WHERE id',
      'ORDER BY',
      'GROUP BY',
      'INNER JOIN',
      'LEFT JOIN',
      'COUNT(*)',
      'SUM(price)',
      'AVG(rating)',
      'MAX(date)',
      'MIN(value)',
      'INSERT INTO',
      'UPDATE SET',
      'DELETE FROM',
      'CREATE TABLE',
      'ALTER TABLE',
      'DROP TABLE',
      'INDEX ON',
      'UNIQUE KEY',
      'PRIMARY KEY',
      'FOREIGN KEY',
      'NOT NULL',
      'DEFAULT 0',
      'AUTO_INCREMENT',
      'VARCHAR(255)',
      'TEXT',
      'INTEGER',
      'BOOLEAN',
      'TIMESTAMP',
      'DATETIME',
      'DATE',
      'DECIMAL(10,2)',
      'ENUM(',
      'SET(',
      'JSON',
      'BLOB',
      'LONGTEXT'
    ];

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const fontSize = 10;
    const columns = Math.floor(canvas.width / fontSize);
    
    // Array to store the y position of each column
    const drops: number[] = [];
    
    // Initialize all drops at the top
    for (let x = 0; x < columns; x++) {
      drops[x] = 1;
    }

    function draw() {
      if (!ctx || !canvas) return;
      
      // Create a semi-transparent black rectangle to fade the previous frame
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Set the font and fill style for the code
      ctx.fillStyle = '#dc2626'; // Red color matching the theme
      ctx.font = `${fontSize}px 'Courier New', monospace`;
      
      // Loop through the drops
      for (let i = 0; i < drops.length; i++) {
        // Get a random code snippet
        const text = codeSnippets[Math.floor(Math.random() * codeSnippets.length)];
        
        // Draw the code snippet
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);
        
        // Randomly reset the drop to the top
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        
        // Move the drop down
        drops[i]++;
      }
    }

    const interval = setInterval(draw, speed);

    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [speed]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full opacity-20 pointer-events-none ${className}`}
      style={{ zIndex: 1 }}
    />
  );
}