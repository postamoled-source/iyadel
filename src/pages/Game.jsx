import { useEffect, useRef } from 'react';
import { createGame } from '@/game/config';
import { useSeo } from '@/lib/analytics';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function Game() {
  const containerRef = useRef(null);
  const gameRef = useRef(null);

  useSeo({
    title: 'IYADEL Game',
    description: 'Play IYADEL — a fast 2D action run-and-gun game built into the iyadel platform.',
    path: '/Game',
  });

  useEffect(() => {
    if (!containerRef.current || gameRef.current) return;
    gameRef.current = createGame(containerRef.current);
    return () => {
      gameRef.current?.destroy(true);
      gameRef.current = null;
    };
  }, []);

  return (
    <div className="min-h-[100dvh] bg-background flex flex-col">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>
        <span className="text-sm font-semibold text-foreground">IYADEL</span>
      </div>
      <div ref={containerRef} className="flex-1 w-full" />
    </div>
  );
}