import React from 'react';

interface SkeletonProps {
  height?: string;
  width?: string;
  borderRadius?: string;
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  height = '1.5rem',
  width = '100%',
  borderRadius = 'var(--radius-md)',
  className = '',
}) => {
  return (
    <div
      className={`skeleton-shimmer ${className}`}
      style={{
        height,
        width,
        borderRadius,
        background:
          'linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 75%)',
        backgroundSize: '200% 100%',
        animation: 'skeletonWave 1.8s infinite',
      }}
    />
  );
};
