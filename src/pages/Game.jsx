import { useEffect, useRef } from 'react';
import { IyadelGame3D } from '@/game3d/IyadelGame3D';
import { useSeo } from '@/lib/analytics';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function Game() {
  const containerRef = useRef(null);
  const gameRef = useRef(null);

  useSeo({
    title: 'IYADEL 3D Game',
    description: 'Play IYADEL 3D — a fast 3D run-and-gun action game built with Three.js.',
    path: '/Game',
  });

  useEffect(() => {
    if (!containerRef.current || gameRef.current) return;
    gameRef.current = new IyadelGame3D(containerRef.current);
    return () => {
      gameRef.current?.destroy();
      gameRef.current = null;
    };
  }, []);

  return (
    <div className="h-[100dvh] bg-background flex flex-col overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>
        <span className="text-sm font-semibold text-foreground">IYADEL 3D</span>
      </div>
      <div ref={containerRef} className="flex-1 w-full" />
    </div>
  );
}