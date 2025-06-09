
import React from 'react';

interface BrainLogoProps {
  className?: string;
  size?: number;
}

export const BrainLogo: React.FC<BrainLogoProps> = ({ className = "", size = 40 }) => {
  return (
    <div className={`inline-block ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="animate-pulse"
      >
        {/* Definições de gradientes e filtros */}
        <defs>
          <linearGradient id="brainGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ff0000" />
            <stop offset="50%" stopColor="#ff6b6b" />
            <stop offset="100%" stopColor="#ff9999" />
          </linearGradient>
          
          <linearGradient id="energyGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00ffff" />
            <stop offset="50%" stopColor="#0099ff" />
            <stop offset="100%" stopColor="#0066ff" />
          </linearGradient>
          
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge> 
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Cérebro principal */}
        <path
          d="M30 25 C25 20, 20 25, 20 35 C15 40, 18 50, 25 55 C30 60, 35 58, 40 55 C45 58, 50 60, 55 55 C62 50, 65 40, 60 35 C60 25, 55 20, 50 25 C45 15, 35 15, 30 25 Z"
          fill="url(#brainGradient)"
          stroke="#ff0000"
          strokeWidth="1.5"
          filter="url(#glow)"
          className="animate-pulse"
        />

        {/* Sulcos do cérebro */}
        <path
          d="M28 30 C35 32, 42 30, 48 32"
          stroke="#cc0000"
          strokeWidth="1.5"
          fill="none"
          className="animate-pulse"
        />
        
        <path
          d="M26 38 C33 40, 40 38, 46 40"
          stroke="#cc0000"
          strokeWidth="1.5"
          fill="none"
          className="animate-pulse"
        />
        
        <path
          d="M28 46 C35 48, 42 46, 48 48"
          stroke="#cc0000"
          strokeWidth="1.5"
          fill="none"
          className="animate-pulse"
        />

        {/* Raios de energia animados */}
        <g className="animate-spin" style={{ transformOrigin: '50px 40px', animationDuration: '3s' }}>
          <line
            x1="50"
            y1="15"
            x2="50"
            y2="8"
            stroke="url(#energyGradient)"
            strokeWidth="2"
            filter="url(#glow)"
            className="animate-pulse"
          />
          <line
            x1="68"
            y1="25"
            x2="75"
            y2="18"
            stroke="url(#energyGradient)"
            strokeWidth="2"
            filter="url(#glow)"
            className="animate-pulse"
          />
          <line
            x1="72"
            y1="45"
            x2="79"
            y2="45"
            stroke="url(#energyGradient)"
            strokeWidth="2"
            filter="url(#glow)"
            className="animate-pulse"
          />
          <line
            x1="68"
            y1="60"
            x2="75"
            y2="67"
            stroke="url(#energyGradient)"
            strokeWidth="2"
            filter="url(#glow)"
            className="animate-pulse"
          />
          <line
            x1="32"
            y1="25"
            x2="25"
            y2="18"
            stroke="url(#energyGradient)"
            strokeWidth="2"
            filter="url(#glow)"
            className="animate-pulse"
          />
          <line
            x1="28"
            y1="45"
            x2="21"
            y2="45"
            stroke="url(#energyGradient)"
            strokeWidth="2"
            filter="url(#glow)"
            className="animate-pulse"
          />
          <line
            x1="32"
            y1="60"
            x2="25"
            y2="67"
            stroke="url(#energyGradient)"
            strokeWidth="2"
            filter="url(#glow)"
            className="animate-pulse"
          />
        </g>

        {/* Circuitos neurais energizados */}
        <circle
          cx="35"
          cy="35"
          r="2"
          fill="#00ffff"
          filter="url(#glow)"
          className="animate-ping"
        />
        <circle
          cx="50"
          cy="40"
          r="2"
          fill="#00ffff"
          filter="url(#glow)"
          className="animate-ping"
          style={{ animationDelay: '0.5s' }}
        />
        <circle
          cx="45"
          cy="50"
          r="2"
          fill="#00ffff"
          filter="url(#glow)"
          className="animate-ping"
          style={{ animationDelay: '1s' }}
        />

        {/* Ondas de energia */}
        <circle
          cx="50"
          cy="40"
          r="15"
          fill="none"
          stroke="#0099ff"
          strokeWidth="0.5"
          opacity="0.3"
          className="animate-ping"
          style={{ animationDuration: '2s' }}
        />
        <circle
          cx="50"
          cy="40"
          r="25"
          fill="none"
          stroke="#0066ff"
          strokeWidth="0.3"
          opacity="0.2"
          className="animate-ping"
          style={{ animationDuration: '3s', animationDelay: '0.5s' }}
        />
      </svg>
    </div>
  );
};

export default BrainLogo;
