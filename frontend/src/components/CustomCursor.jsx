import { useEffect, useState, useRef } from 'react';

export default function CustomCursor() {
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [ringPos, setRingPos] = useState({ x: -100, y: -100 });
  const [hovering, setHovering] = useState(false);
  const [visible, setVisible] = useState(false);
  const posRef = useRef({ x: -100, y: -100 });
  const ringRef = useRef({ x: -100, y: -100 });

  useEffect(() => {
    if (typeof window === 'undefined' || 'ontouchstart' in window) return;
    document.body.classList.add('has-custom-cursor');

    const handleMove = (e) => {
      posRef.current = { x: e.clientX, y: e.clientY };
      setPos(posRef.current);
      setVisible(true);
    };

    let raf;
    const animate = () => {
      const p = posRef.current;
      ringRef.current.x += (p.x - ringRef.current.x) * 0.15;
      ringRef.current.y += (p.y - ringRef.current.y) * 0.15;
      setRingPos({ x: ringRef.current.x, y: ringRef.current.y });
      raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);

    const handleEnter = () => setHovering(true);
    const handleLeave = () => setHovering(false);

    const els = document.querySelectorAll('a, button, [role="button"]');
    els.forEach((el) => {
      el.addEventListener('mouseenter', handleEnter);
      el.addEventListener('mouseleave', handleLeave);
    });
    window.addEventListener('mousemove', handleMove);

    return () => {
      document.body.classList.remove('has-custom-cursor');
      cancelAnimationFrame(raf);
      window.removeEventListener('mousemove', handleMove);
      els.forEach((el) => {
        el.removeEventListener('mouseenter', handleEnter);
        el.removeEventListener('mouseleave', handleLeave);
      });
    };
  }, []);

  if (typeof window !== 'undefined' && 'ontouchstart' in window) return null;

  return (
    <>
      <div
        className="cursor-dot"
        style={{
          left: pos.x,
          top: pos.y,
          transform: 'translate(-50%, -50%)',
          opacity: visible ? 1 : 0,
        }}
      />
      <div
        className={`cursor-ring ${hovering ? 'hover' : ''}`}
        style={{
          left: ringPos.x,
          top: ringPos.y,
          transform: 'translate(-50%, -50%)',
          opacity: visible ? 1 : 0,
        }}
      />
    </>
  );
}
