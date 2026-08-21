import { useEffect, useRef, useState } from 'react';
import { IyadelGame3D } from '@/game3d/IyadelGame3D';
import { useSeo } from '@/lib/analytics';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function Game() {
  const containerRef = useRef(null);
  const gameRef = useRef(null);
  const [portrait, setPortrait] = useState(() =>
    typeof window !== 'undefined' && window.innerHeight > window.innerWidth
  );

  useSeo({
    title: 'IYADEL 3D Game',
    description: 'Play IYADEL 3D — a fast 3D run-and-gun action game built with Three.js.',
    path: '/Game',
  });

  useEffect(() => {
    const check = () => setPortrait(window.innerHeight > window.innerWidth);
    check();
    window.addEventListener('resize', check);
    window.addEventListener('orientationchange', check);
    return () => {
      window.removeEventListener('resize', check);
      window.removeEventListener('orientationchange', check);
    };
  }, []);

  useEffect(() => {
    if (!containerRef.current || gameRef.current) return;
    gameRef.current = new IyadelGame3D(containerRef.current);
    return () => {
      gameRef.current?.destroy();
      gameRef.current = null;
    };
  }, []);

  useEffect(() => {
    const t = setTimeout(() => gameRef.current?.resize?.(), 60);
    return () => clearTimeout(t);
  }, [portrait]);

  // Force a landscape stage on portrait phones via CSS rotation.
  const stageStyle = portrait
    ? {
        position: 'absolute',
        top: '50%',
        left: '50%',
        width: '100vh',
        height: '100vw',
        transform: 'translate(-50%, -50%) rotate(90deg)',
        transformOrigin: 'center center',
      }
    : { position: 'absolute', inset: 0 };

  return (
    <div className="fixed inset-0 bg-black overflow-hidden">
      <div ref={containerRef} style={stageStyle} />
      <Link
        to="/"
        className="absolute top-3 left-3 z-50 inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-black/55 text-white text-xs font-semibold backdrop-blur-sm hover:bg-black/75"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Exit
      </Link>
    </div>
  );
}