
import React, { useMemo } from 'react';

const BUBBLE_COUNT = 25;

interface BubbleProps {
  left: string;
  size: string;
  duration: string;
  delay: string;
  swayDuration: string;
}

const Bubble: React.FC<BubbleProps> = ({ left, size, duration, delay, swayDuration }) => {
  return (
    <div
      className="bubble"
      style={{
        left,
        width: size,
        height: size,
        animation: `bubbleRise ${duration} linear infinite ${delay}, bubbleSway ${swayDuration} ease-in-out infinite alternate`,
      }}
    >
      <div className="absolute top-1/4 left-1/4 w-1/4 h-1/4 bg-white/30 rounded-full blur-[1px]"></div>
    </div>
  );
};

export const BubbleBackground: React.FC = () => {
  const bubbles = useMemo(() => {
    return Array.from({ length: BUBBLE_COUNT }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      size: `${10 + Math.random() * 60}px`,
      duration: `${10 + Math.random() * 15}s`,
      delay: `${Math.random() * 10}s`,
      swayDuration: `${3 + Math.random() * 4}s`,
    }));
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {bubbles.map((b) => (
        <Bubble key={b.id} {...b} />
      ))}
    </div>
  );
};
