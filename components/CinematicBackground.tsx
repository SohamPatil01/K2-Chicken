"use client";

import { useRef, useEffect, useState } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";

export default function CinematicBackground() {
  const [mounted, setMounted] = useState(false);
  const { scrollY } = useScroll();

  // Parallax effect for the background image
  const y = useTransform(scrollY, [0, 500], [0, 200]);
  const opacity = useTransform(scrollY, [0, 500], [1, 0.3]);
  const scale = useTransform(scrollY, [0, 500], [1.1, 1.2]); // Gentle zoom on scroll

  useEffect(() => {
    setMounted(true);
  }, []);

  // Generate random particles
  const particles = Array.from({ length: 20 }).map((_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 4 + 1,
    duration: Math.random() * 20 + 10,
    delay: Math.random() * 5,
  }));

  if (!mounted) return null;

  return (
    <div className="absolute inset-0 overflow-hidden w-full h-full bg-white">
      {/* Main Hero Image with Ken Burns Effect */}
      <motion.div
        className="absolute inset-0 w-full h-full"
        style={{ y, opacity, scale }}
      >
        <motion.div
          className="w-full h-full bg-cover bg-center"
          style={{
            backgroundImage: "url('/hero-fresh-simple.png')",
          }}
          initial={{ scale: 1.05 }}
          animate={{
            scale: 1.1,
            x: ["0%", "-1%", "0%", "1%", "0%"],
            y: ["0%", "-1%", "0%", "1%", "0%"]
          }}
          transition={{
            scale: { duration: 25, repeat: Infinity, repeatType: "reverse", ease: "linear" },
            x: { duration: 30, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" },
            y: { duration: 35, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }
          }}
        />
        {/* Lighter, Fresh Overlay - White/Orange Theme */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/60 via-white/30 to-transparent" />
      </motion.div>

      {/* Subtle Floating Dust (Simpler than before) */}
      <div className="absolute inset-0 pointer-events-none">
        {particles.map((p) => (
          <motion.div
            key={p.id}
            className="absolute rounded-full bg-red-50/30 blur-[1px]"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: p.size,
              height: p.size,
            }}
            animate={{
              y: [0, -50],
              opacity: [0, 0.5, 0],
            }}
            transition={{
              duration: p.duration,
              repeat: Infinity,
              delay: p.delay,
              ease: "linear",
            }}
          />
        ))}
      </div>
    </div>
  );
}
