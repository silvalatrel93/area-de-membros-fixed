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

    // Caracteres que podem aparecer (incluindo números, letras e símbolos japoneses)
    const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ田中佐藤鈴木高橋伊藤渡辺山本中村小林加藤吉田山田佐々木山口松本井上木村林清水山崎森池橋本石川上田原田小川中川斉藤新井千葉";
    const charArray = chars.split('');

    const fontSize = 14;
    const columns = Math.floor(canvas.width / fontSize);
    const drops: number[] = [];

    // Inicializar as gotas
    for (let i = 0; i < columns; i++) {
      drops[i] = Math.random() * -100;
    }

    // Função de animação
    const draw = () => {
      // Fundo semi-transparente para criar o efeito de trilha
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Configurar o texto
      ctx.fillStyle = '#E50914'; // Vermelho Netflix
      ctx.font = `${fontSize}px monospace`;

      // Desenhar os caracteres
      for (let i = 0; i < drops.length; i++) {
        // Caractere aleatório
        const char = charArray[Math.floor(Math.random() * charArray.length)];
        
        // Posição X e Y
        const x = i * fontSize;
        const y = drops[i] * fontSize;

        // Desenhar o caractere
        ctx.fillText(char, x, y);

        // Resetar a gota quando sair da tela ou aleatoriamente
        if (y > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }

        // Mover a gota para baixo
        drops[i]++;
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