'use client';

import { useInView, motion, useSpring, useTransform } from 'framer-motion';
import { useRef, useEffect } from 'react';

import { Stat } from '@/core/types';

interface StatsProps {
  stats?: Stat[];
}

function Counter({ value }: { value: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  
  // Extract number from string (e.g., "500+" -> 500)
  const numericValue = parseInt(value) || 0;
  const suffix = value.replace(/[0-9]/g, '');

  const spring = useSpring(0, {
    mass: 1,
    stiffness: 100,
    damping: 30,
  });

  const display = useTransform(spring, (latest) => Math.floor(latest).toLocaleString() + suffix);

  useEffect(() => {
    if (isInView) {
      spring.set(numericValue);
    }
  }, [isInView, numericValue, spring]);

  return <motion.span ref={ref}>{display}</motion.span>;
}

export default function StatsSection({ stats }: StatsProps) {
  const displayData = stats || [];
  if (displayData.length === 0) return null;

  // Clone and sort to avoid mutation issues
  const sortedData = [...displayData].sort((a,b) => (a.order || 0) - (b.order || 0));

  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-px bg-black/5 border border-black/5 rounded-[40px] overflow-hidden mt-12 md:mt-16 shadow-2xl premium-shadow">
      {sortedData.map((stat, idx) => (
        <div key={stat.id || idx} className="bg-[#fbfcff] py-16 px-8 text-center transition-all duration-500 hover:bg-white z-10 relative group">
          <div className="text-[54px] font-black bg-clip-text text-transparent bg-gradient-to-br from-blue-600 to-teal mb-3 tracking-tighter leading-none italic uppercase">
            {stat.value.includes('/') ? <span>{stat.value}</span> : <Counter value={stat.value} />}
          </div>
          <div className="text-black/40 text-[11px] font-black tracking-[0.3em] uppercase group-hover:text-black/60 transition-colors">
            {stat.label}
          </div>
        </div>
      ))}
    </div>
  );
}
