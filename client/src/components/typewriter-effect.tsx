import { useState, useEffect } from 'react';

interface TypewriterEffectProps {
  text: string;
  speed?: number;
  delay?: number;
  className?: string;
  showCursor?: boolean;
  cursorChar?: string;
  onComplete?: () => void;
}

export default function TypewriterEffect({
  text,
  speed = 100,
  delay = 0,
  className = '',
  showCursor = true,
  cursorChar = '_',
  onComplete
}: TypewriterEffectProps) {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [showCursorBlink, setShowCursorBlink] = useState(true);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, currentIndex === 0 ? delay : speed);

      return () => clearTimeout(timeout);
    } else if (!isComplete) {
      setIsComplete(true);
      onComplete?.();
    }
  }, [currentIndex, text, speed, delay, isComplete, onComplete]);

  // Cursor blinking effect
  useEffect(() => {
    if (showCursor) {
      const interval = setInterval(() => {
        setShowCursorBlink(prev => !prev);
      }, 530);

      return () => clearInterval(interval);
    }
  }, [showCursor]);

  return (
    <span className={className}>
      {displayText}
      {showCursor && (
        <span 
          className={`inline-block text-netflix-red ml-1 ${
            showCursorBlink ? 'opacity-100' : 'opacity-0'
          } transition-opacity duration-100`}
        >
          {cursorChar}
        </span>
      )}
    </span>
  );
}