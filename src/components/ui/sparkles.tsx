'use client';

import { useMemo, useCallback } from 'react';
import { cnjoin } from '@/lib/utils';
import Particles from 'react-tsparticles';
import { type ISourceOptions } from 'tsparticles-engine';
import { loadSlim } from 'tsparticles-slim';

export function SparklesCore({
  className = '',
  particleColor = '#ffffff',
}: {
  className?: string;
  particleColor?: string;
}) {
  const particlesInit = useCallback(async (engine: import('tsparticles-engine').Engine) => {
    await loadSlim(engine);
  }, []);

  const options: ISourceOptions = useMemo(
    () => ({
      background: { color: { value: 'transparent' } },
      fpsLimit: 60,
      particles: {
        color: { value: particleColor },
        links: { enable: true, color: particleColor, distance: 100 },
        move: { enable: true, speed: 0.2 },
        number: { value: 50 },
        opacity: { value: 0.3 },
        shape: { type: 'circle' },
        size: { value: 2 },
      },
      detectRetina: true,
    }),
    [particleColor]
  );

  return (
    <div className={cnjoin('absolute inset-0 z-0 pointer-events-none', className)}>
      <Particles init={particlesInit} options={options} />
    </div>
  );
}
