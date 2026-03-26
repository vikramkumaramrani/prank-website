import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { PrankButton } from './components/PrankButton';
import { TauntDisplay } from './components/TauntDisplay';
import { BubbleBackground } from './components/BubbleBackground';
import { GeminiService } from './services/geminiService';
import confetti from 'https://cdn.skypack.dev/canvas-confetti';

const PRANK_DURATION = 40; 
const CELEBRATION_SOUND_URL = 'https://actions.google.com/sounds/v1/cartoon/conga_drum_accent_variation.ogg';
const WHOOSH_SOUND_URL = 'https://actions.google.com/sounds/v1/foley/whoosh.ogg';
const SPRINKLE_SOUND_URL = 'https://actions.google.com/sounds/v1/cartoon/magic_wand_noise.ogg';

// Define interface for MagneticLetter props to ensure type safety
interface MagneticLetterProps {
  char: string;
  index: number;
  mousePos: { x: number; y: number };
}

// Fix: Use React.FC with MagneticLetterProps to correctly handle reserved props like 'key' and improve type inference
const MagneticLetter: React.FC<MagneticLetterProps> = ({ char, index, mousePos }) => {
  const letterRef = useRef<HTMLSpanElement>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!letterRef.current) return;

    const rect = letterRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const dx = mousePos.x - centerX;
    const dy = mousePos.y - centerY;
    const distance = Math.hypot(dx, dy);

    // If mouse is within 100px of the letter, push it away
    if (distance < 100) {
      const angle = Math.atan2(dy, dx);
      const force = (100 - distance) / 2;
      setOffset({
        x: -Math.cos(angle) * force,
        y: -Math.sin(angle) * force,
      });
    } else {
      setOffset({ x: 0, y: 0 });
    }
  }, [mousePos]);

  return (
    <span
      ref={letterRef}
      className="letter-animate inline-block transition-transform duration-200 ease-out"
      style={{
        animationDelay: `${index * 0.1}s`,
        transform: `translate(${offset.x}px, ${offset.y}px)`,
      }}
    >
      {char === ' ' ? '\u00A0' : char}
    </span>
  );
};

const AnimatedText = ({ text, className }: { text: string; className?: string }) => {
  const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 });

  useEffect(() => {
    const handleMove = (e: MouseEvent) => setMousePos({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', handleMove);
    return () => window.removeEventListener('mousemove', handleMove);
  }, []);

  return (
    <span className={`inline-block relative group ${className}`}>
      {/* Background Glitch Layer 1 */}
      <span className="absolute inset-0 opacity-0 group-hover:opacity-100 group-hover:animate-pulse text-red-500 translate-x-1 -z-10 select-none pointer-events-none">
        {text}
      </span>
      {/* Background Glitch Layer 2 */}
      <span className="absolute inset-0 opacity-0 group-hover:opacity-100 group-hover:animate-pulse text-blue-500 -translate-x-1 -z-10 select-none pointer-events-none">
        {text}
      </span>
      
      {text.split('').map((char, index) => (
        <MagneticLetter key={index} char={char} index={index} mousePos={mousePos} />
      ))}
    </span>
  );
};

const App: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState(PRANK_DURATION);
  const [isPrankActive, setIsPrankActive] = useState(true);
  const [taunts, setTaunts] = useState<string[]>([]);
  const [currentTaunt, setCurrentTaunt] = useState("Go ahead... try to click it.");
  const [clickCount, setClickCount] = useState(0);
  const [showWinMessage, setShowWinMessage] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const moveAudioRef = useRef<HTMLAudioElement | null>(null);
  const sprinkleAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio(CELEBRATION_SOUND_URL);
    const moveAudio = new Audio(WHOOSH_SOUND_URL);
    moveAudio.volume = 0.3;
    moveAudioRef.current = moveAudio;
    const sprinkleAudio = new Audio(SPRINKLE_SOUND_URL);
    sprinkleAudio.volume = 0.5;
    sprinkleAudioRef.current = sprinkleAudio;
  }, []);

  useEffect(() => {
    const fetchTaunts = async () => {
      try {
        const generatedTaunts = await GeminiService.generateTaunts();
        setTaunts(generatedTaunts);
      } catch (error) {
        setTaunts([
          "Too slow!",
          "Maybe next time?",
          "Almost had it!",
          "Are you even trying?",
          "The button is faster than light!",
          "C'mon, my grandma clicks faster!"
        ]);
      }
    };
    fetchTaunts();
  }, []);

  useEffect(() => {
    if (timeLeft <= 0) {
      if (isPrankActive) {
        setIsPrankActive(false);
        setCurrentTaunt("Alright, alright... I'll stay still now.");
        if (audioRef.current) {
          audioRef.current.play().catch(() => {});
        }

        const duration = 3 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };
        const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

        const interval: any = setInterval(function() {
          const timeLeftConfetti = animationEnd - Date.now();
          if (timeLeftConfetti <= 0) return clearInterval(interval);

          if (sprinkleAudioRef.current) {
            const soundClone = sprinkleAudioRef.current.cloneNode() as HTMLAudioElement;
            soundClone.volume = 0.3;
            soundClone.play().catch(() => {});
          }

          const particleCount = 40 * (timeLeftConfetti / duration);
          confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
          confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
        }, 400);
      }
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, isPrankActive]);

  const handleNearMiss = useCallback(() => {
    if (!isPrankActive) return;
    if (moveAudioRef.current) {
      moveAudioRef.current.currentTime = 0;
      moveAudioRef.current.play().catch(() => {});
    }
    setClickCount(prev => prev + 1);
    if (taunts.length > 0) {
      const randomTaunt = taunts[Math.floor(Math.random() * taunts.length)];
      setCurrentTaunt(randomTaunt);
    }
  }, [isPrankActive, taunts]);

  const handleFinalClick = () => {
    if (isPrankActive) return;
    setShowWinMessage(true);
    if (sprinkleAudioRef.current) {
      sprinkleAudioRef.current.currentTime = 0;
      sprinkleAudioRef.current.play().catch(() => {});
    }
    confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="relative w-full h-screen flex flex-col items-center justify-center p-4">
      <BubbleBackground />

      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-pink-500 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500 rounded-full blur-[120px]"></div>
      </div>

      <div className="z-10 text-center mb-12 animate-fade-in">
        <h1 className="text-4xl md:text-7xl font-black mb-4 tracking-tighter drop-shadow-2xl flex flex-col items-center">
          <span className="text-sm uppercase tracking-[0.5em] text-white/40 mb-2 font-mono">Presenting</span>
          <div>
            THE <AnimatedText 
              text="UNCLICKABLE" 
              className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-orange-500 to-red-500 animate-text-shine cursor-default" 
            /> BUTTON
          </div>
        </h1>
        <p className="text-gray-300 text-lg md:text-xl font-medium max-w-md mx-auto opacity-80">
          Legends say if you click it, you gain infinite wisdom. Or just a cookie.
        </p>
      </div>

      <div className="z-10 flex gap-8 mb-8">
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-6 py-3 flex flex-col items-center shadow-2xl transition-all duration-500 hover:bg-white/20">
          <span className="text-xs uppercase tracking-widest text-blue-300 font-bold mb-1">Time to Reveal</span>
          <span className={`text-3xl font-mono font-bold transition-colors ${timeLeft < 10 ? 'text-red-400 animate-pulse' : 'text-white'}`}>
            {formatTime(timeLeft)}
          </span>
        </div>
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-6 py-3 flex flex-col items-center shadow-2xl transition-all duration-500 hover:bg-white/20">
          <span className="text-xs uppercase tracking-widest text-pink-300 font-bold mb-1">Misses</span>
          <span className="text-3xl font-mono font-bold text-white">
            {clickCount}
          </span>
        </div>
      </div>

      <TauntDisplay message={currentTaunt} />

      <PrankButton 
        isPrankActive={isPrankActive} 
        onNearMiss={handleNearMiss} 
        onFinalClick={handleFinalClick}
      />

      {showWinMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white text-gray-900 rounded-3xl p-8 max-w-sm w-full shadow-[0_0_50px_rgba(255,255,255,0.3)] text-center transform scale-110 transition-transform">
            <div className="text-6xl mb-4">😅</div>
            <h2 className="text-3xl font-bold mb-2">Prank over!</h2>
            <p className="text-gray-600 mb-6 font-medium">
              You've proven your patience. The button is finally yours!
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold hover:shadow-lg transition-all active:scale-95"
            >
              Play Again?
            </button>
          </div>
        </div>
      )}

      <div className="absolute bottom-8 text-gray-400/50 text-xs font-mono tracking-widest uppercase">
        Instruction: Try to catch the button.
      </div>
    </div>
  );
};

export default App;