import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { IyadelGame3D } from '@/game3d/IyadelGame3D';
import { useSeo } from '@/lib/analytics';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function Game() {
  const containerRef = useRef(null);
  const gameRef = useRef(null);
  const [size, setSize] = useState(() => ({ w: window.innerWidth, h: window.innerHeight }));

  useSeo({
    title: 'IYADEL 3D Game',
    description: 'Play IYADEL 3D — a fast 3D run-and-gun action game built with Three.js.',
    path: '/Game',
  });

  // Track the real viewport so we can force a landscape stage on portrait screens.
  useEffect(() => {
    const measure = () => setSize({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener('resize', measure);
    window.addEventListener('orientationchange', measure);
    measure();
    return () => {
      window.removeEventListener('resize', measure);
      window.removeEventListener('orientationchange', measure);
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

  const portrait = size.h > size.w && size.w > 0;
  useEffect(() => {
    gameRef.current?.setRotated?.(portrait);
    const t = setTimeout(() => gameRef.current?.resize?.(), 60);
    return () => clearTimeout(t);
  }, [portrait]);

  // Rotated landscape stage sized in real pixels (avoids 100vh/100vw mismatch
  // with the visible area). After a 90° CW rotation the stage fills the screen.
  const stageStyle = portrait
    ? {
        position: 'absolute',
        top: 0,
        left: `${size.w}px`,
        width: `${size.h}px`,
        height: `${size.w}px`,
        transform: 'rotate(90deg)',
        transformOrigin: 'top left',
      }
    : { position: 'absolute', inset: 0 };

  return createPortal(
    <div className="fixed inset-0 bg-black overflow-hidden" style={{ touchAction: 'none', zIndex: 2147483000 }}>
      <div ref={containerRef} style={stageStyle} />
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