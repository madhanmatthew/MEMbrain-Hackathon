"use client";

import { motion } from "framer-motion";
import { Button } from "./button";

function FloatingPaths({ position }) {
  const paths = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    d: `M-${380 - i * 5 * position} -${189 + i * 6}
        C-${380 - i * 5 * position} -${189 + i * 6}
        -${312 - i * 5 * position} ${216 - i * 6}
        ${152 - i * 5 * position} ${343 - i * 6}
        C${616 - i * 5 * position} ${470 - i * 6}
        ${684 - i * 5 * position} ${875 - i * 6}
        ${684 - i * 5 * position} ${875 - i * 6}`,
    width: 0.5 + i * 0.03,
  }));

  return (
    <div className="absolute inset-0 pointer-events-none">
      <svg className="w-full h-full" viewBox="0 0 696 316" fill="none">
        {paths.map((path) => (
          <motion.path
            key={path.id}
            d={path.d}
            stroke="rgba(255,255,255,0.1)"
            strokeWidth={path.width}
            initial={{ pathLength: 0.2, opacity: 0.4 }}
            animate={{
              pathLength: 1,
              opacity: [0.2, 0.5, 0.2],
              pathOffset: [0, 1, 0],
            }}
            transition={{
              duration: 20 + Math.random() * 10,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        ))}
      </svg>
    </div>
  );
}

export function BackgroundPaths({ children, title = "GoalPulse" }) {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-neutral-950 text-white">

      {/* Animated paths */}
      <div className="absolute inset-0">
        <FloatingPaths position={1} />
        <FloatingPaths position={-1} />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}