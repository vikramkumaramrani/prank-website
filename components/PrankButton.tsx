
import React, { useState, useEffect, useRef, useCallback } from 'react';

interface PrankButtonProps {
  isPrankActive: boolean;
  onNearMiss: () => void;
  onFinalClick: () => void;
}

const TRAIL_COLORS = [
  'rgba(234, 179, 8, 0.4)',  // Yellow
  'rgba(34, 197, 94, 0.4)',  // Green
  'rgba(59, 130, 246, 0.4)', // Blue
  'rgba(168, 85, 247, 0.4)', // Purple
  'rgba(236, 72, 153, 0.4)', // Pink
];

export const PrankButton: React.FC<PrankButtonProps> = ({ isPrankActive, onNearMiss, onFinalClick }) => {
  const [position, setPosition] = useState({ x: 50, y: 70 }); // Percentage based initial pos
  const [isMoving, setIsMoving] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  
  // Detection radius (pixels)
  const THRESHOLD = 120;

  const moveButton = useCallback(() => {
    if (!isPrankActive) return;

    // Generate random position within 10% to 90% of viewport to keep button visible
    const newX = 10 + Math.random() * 80;
    const newY = 20 + Math.random() * 60;
    
    setIsMoving(true);
    setPosition({ x: newX, y: newY });
    onNearMiss();

    // Reset moving state after transition
    setTimeout(() => setIsMoving(false), 300);
  }, [isPrankActive, onNearMiss]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isPrankActive || !buttonRef.current) return;

      const rect = buttonRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const distance = Math.hypot(e.clientX - centerX, e.clientY - centerY);

      if (distance < THRESHOLD) {
        moveButton();
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isPrankActive, moveButton]);

  const handleClick = (e: React.MouseEvent) => {
    if (isPrankActive) {
      // Secondary safety measure: button should move if clicked during prank
      moveButton();
    } else {
      onFinalClick();
    }
  };

  return (
    <>
      {/* Rainbow Trail - Only active during prank */}
      {isPrankActive && TRAIL_COLORS.map((color, index) => (
        <div
          key={index}
          className="fixed z-30 px-8 py-4 text-xl font-black rounded-2xl pointer-events-none transition-all duration-300 ease-out"
          style={{
            left: `${position.x}%`,
            top: `${position.y}%`,
            backgroundColor: color,
            transform: `translate(-50%, -50%) scale(${0.95 - index * 0.05})`,
            transitionDelay: `${(index + 1) * 30}ms`,
            opacity: isMoving ? 0.6 : 0,
            filter: 'blur(4px)',
          }}
        >
          <div className="invisible">CLICK ME!</div>
        </div>
      ))}

      {/* Main Button */}
      <button
        ref={buttonRef}
        onClick={handleClick}
        className={`
          fixed z-40 px-8 py-4 text-xl font-black rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)]
          transition-all duration-300 ease-out transform
          ${isPrankActive ? 'cursor-default' : 'cursor-pointer hover:scale-110 active:scale-95 hover:rotate-2'}
          ${isPrankActive ? 'bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500' : 'bg-gradient-to-r from-emerald-400 to-teal-500'}
          text-white border-2 border-white/30
        `}
        style={{
          left: `${position.x}%`,
          top: `${position.y}%`,
          transform: `translate(-50%, -50%) ${isMoving ? 'scale(0.9) rotate(5deg)' : 'scale(1)'}`,
        }}
      >
        <div className="flex items-center gap-3">
          {isPrankActive ? (
            <>
              <i className={`fas ${isMoving ? 'fa-running' : 'fa-hand-pointer'} animate-bounce`}></i>
              CLICK ME!
            </>
          ) : (
            <>
              <i className="fas fa-unlock-alt"></i>
              REVEAL SECRET
            </>
          )}
        </div>
      </button>
    </>
  );
};
