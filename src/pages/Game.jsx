import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
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

  // Portal to document.body so position:fixed resolves to the real viewport
  // regardless of any transformed ancestor in the preview environment.
  return createPortal(
    <div className="fixed inset-0 bg-black overflow-hidden" style={{ touchAction: 'none', zIndex: 2147483000 }}>
      <div ref={containerRef} className="absolute inset-0" />
      <Link
        to="/"
        className="absolute top-3 left-3 z-50 inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-black/55 text-white text-xs font-semibold backdrop-blur-sm hover:bg-black/75"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Exit
      </Link>
    </div>,
    document.body
  );
}