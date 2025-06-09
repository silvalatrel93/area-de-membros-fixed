import { useEffect, useRef } from 'react';

interface MatrixEffectProps {
  className?: string;
}

export default function MatrixEffect({ className = '' }: MatrixEffectProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Configuração do canvas
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Fragmentos de código de programação variados
    const codeFragments = [
      // Palavras-chave JavaScript/TypeScript
      "function", "const", "let", "var", "if", "else", "for", "while", "return", "class",
      "import", "export", "async", "await", "try", "catch", "throw", "new", "this", "super",
      "interface", "type", "enum", "namespace", "module", "extends", "implements", "static",
      
      // React e hooks
      "useState", "useEffect", "useContext", "useCallback", "useMemo", "useRef", "React",
      "component", "props", "state", "render", "JSX", "Fragment", "Provider", "Consumer",
      
      // APIs web
      "console.log", "document", "window", "addEventListener", "querySelector", "getElementById",
      "fetch", "axios", "XMLHttpRequest", "localStorage", "sessionStorage", "navigator",
      
      // Tipos de dados
      "Array", "Object", "String", "Number", "Boolean", "Date", "RegExp", "Promise",
      "null", "undefined", "true", "false", "NaN", "Infinity", "Symbol", "BigInt",
      
      // Operadores
      "=>", "===", "!==", "==", "!=", "&&", "||", "!", "++", "--", "+=", "-=", "*=", "/=", "%=",
      ">>", "<<", ">>>", "&", "|", "^", "~", "**", "??", "?.", "?:",
      
      // Ferramentas e frameworks
      "npm", "yarn", "pnpm", "git", "node", "express", "react", "vue", "angular", "next",
      "webpack", "vite", "rollup", "babel", "typescript", "eslint", "prettier", "jest",
      
      // Backend e database
      "api", "json", "xml", "html", "css", "scss", "sass", "sql", "mongodb", "postgres",
      "mysql", "redis", "auth", "jwt", "oauth", "cors", "middleware", "router", "controller",
      
      // Métodos HTTP e conceitos
      "GET", "POST", "PUT", "DELETE", "PATCH", "HEAD", "OPTIONS", "status", "headers",
      "login", "logout", "register", "user", "admin", "data", "schema", "model", "view",
      
      // Comentários e snippets
      "// TODO:", "// FIXME:", "// NOTE:", "/* eslint-disable */", "* @param", "* @returns",
      "console.error", "console.warn", "console.info", "process.env", "require(", "import(",
      
      // Estruturas de código
      ".map(", ".filter(", ".reduce(", ".forEach(", ".find(", ".some(", ".every(",
      ".then(", ".catch(", ".finally(", ".resolve(", ".reject(", ".all(", ".race(",
      
      // Strings de código comuns
      "404", "500", "200", "401", "403", "localhost", "127.0.0.1", "3000", "8080", "5000"
    ];
    
    // Caracteres individuais para variação
    const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ{}<>[]()=+-*/%&|!?;:.,";
    const charArray = chars.split('');

    const fontSize = 14;
    const columns = Math.floor(canvas.width / fontSize);
    const drops: number[] = [];
    const speeds: number[] = [];
    const glitchChance: number[] = [];

    // Inicializar as gotas com velocidades variadas
    for (let i = 0; i < columns; i++) {
      drops[i] = Math.random() * -100;
      speeds[i] = 0.5 + Math.random() * 1.5; // Velocidade entre 0.5 e 2
      glitchChance[i] = Math.random();
    }

    // Função de animação
    const draw = () => {
      // Fundo semi-transparente para criar o efeito de trilha
      ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Desenhar os caracteres
      for (let i = 0; i < drops.length; i++) {
        // Escolher entre fragmento de código ou caractere individual
        const useCodeFragment = Math.random() > 0.6; // 40% chance de usar fragmento de código
        const content = useCodeFragment 
          ? codeFragments[Math.floor(Math.random() * codeFragments.length)]
          : charArray[Math.floor(Math.random() * charArray.length)];
        
        // Posição X e Y
        const x = i * fontSize;
        const y = drops[i] * fontSize;

        // Efeito de glitch ocasional
        const isGlitch = glitchChance[i] > 0.98;
        
        // Variações de cor e opacidade
        const alpha = Math.random() * 0.8 + 0.2;
        const brightness = isGlitch ? Math.random() * 0.5 + 0.5 : 1;
        
        // Configurar estilo baseado no tipo de conteúdo
        if (isGlitch) {
          // Efeito glitch com cores variadas
          const glitchColors = ['#E50914', '#FF6B6B', '#FF3030', '#CC0000', '#990000'];
          ctx.fillStyle = glitchColors[Math.floor(Math.random() * glitchColors.length)];
          ctx.font = `${fontSize + Math.random() * 4}px monospace`;
        } else if (useCodeFragment) {
          // Fragmentos de código com cor mais intensa
          ctx.fillStyle = `rgba(229, 9, 20, ${Math.min(alpha * brightness + 0.3, 1)})`;
          ctx.font = `${fontSize - 2}px monospace`;
        } else {
          // Caracteres individuais com cor normal
          ctx.fillStyle = `rgba(229, 9, 20, ${alpha * brightness * 0.7})`;
          ctx.font = `${fontSize}px monospace`;
        }

        // Desenhar o conteúdo
        ctx.fillText(content, x, y);

        // Resetar fonte para próxima iteração
        ctx.font = `${fontSize}px monospace`;

        // Resetar a gota quando sair da tela ou aleatoriamente
        if (y > canvas.height && Math.random() > 0.975) {
          drops[i] = Math.random() * -50;
          speeds[i] = 0.5 + Math.random() * 1.5;
          glitchChance[i] = Math.random();
        }

        // Mover a gota para baixo com velocidade variável
        drops[i] += speeds[i];
      }
    };

    // Iniciar a animação
    const interval = setInterval(draw, 50);

    // Cleanup
    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 pointer-events-none z-0 ${className}`}
      style={{ 
        background: 'linear-gradient(135deg, #0a0a0a 0%, #1a0505 50%, #0a0a0a 100%)'
      }}
    />
  );
}