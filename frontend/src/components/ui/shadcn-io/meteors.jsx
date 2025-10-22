import React, { useMemo } from 'react';

function random(min, max) {
  return Math.random() * (max - min) + min;
}

export function Meteors({ number = 28, color = '#8b5cf6' }) {
  const meteors = useMemo(() => {
    return Array.from({ length: number }).map((_, i) => {
      const size = random(2, 6);
      const duration = random(4, 10);
      const delay = random(-10, 0);
      const startX = random(-20, 100);
      const startY = random(-30, 30);
      const opacity = random(0.35, 0.9);
      const skew = random(-20, 20);
      return { i, size, duration, delay, startX, startY, opacity, skew };
    });
  }, [number]);

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
      {meteors.map((m) => (
        <div
          key={m.i}
          style={{
            position: 'absolute',
            top: `${m.startY}%`,
            left: `${m.startX}%`,
            transform: `translate(-50%, -50%) rotate(${m.skew}deg)`,
            opacity: m.opacity,
            pointerEvents: 'none',
            willChange: 'transform, opacity',
            zIndex: 0,
          }}
        >
          <div
            style={{
              width: `${m.size * 14}px`,
              height: `${Math.max(1, m.size / 2)}px`,
              background: `linear-gradient(90deg, ${color}, rgba(0,0,0,0))`,
              filter: 'blur(6px)',
              transformOrigin: 'left center',
              animation: `meteor-tail ${m.duration}s linear ${m.delay}s infinite`,
            }}
          />

          <div
            style={{
              width: `${m.size}px`,
              height: `${m.size}px`,
              borderRadius: '50%',
              background: color,
              boxShadow: `0 0 ${Math.max(6, m.size * 2)}px ${color}`,
              animation: `meteor-head ${m.duration}s linear ${m.delay}s infinite`,
            }}
          />
        </div>
      ))}

      <style>{`
        @keyframes meteor-tail {
          0% { transform: translate(-100vw, -20vh) scaleX(0.2); opacity: 0 }
          10% { opacity: 1 }
          100% { transform: translate(120vw, 120vh) scaleX(1); opacity: 0 }
        }
        @keyframes meteor-head {
          0% { transform: translate(-100vw, -20vh) scale(0.6); opacity: 0 }
          10% { opacity: 1 }
          100% { transform: translate(120vw, 120vh) scale(1); opacity: 0 }
        }
      `}</style>
    </div>
  );
}

export default Meteors;
