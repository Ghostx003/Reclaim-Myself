import React from 'react';

interface DonutProgressProps {
  percentage: number; // 0 to 100
  size?: number; // width/height in px
  strokeWidth?: number;
  color?: string;
  trackColor?: string;
  showLabel?: boolean;
  labelText?: string;
  subLabel?: string;
  className?: string;
}

export const DonutProgress: React.FC<DonutProgressProps> = ({
  percentage,
  size = 64,
  strokeWidth = 6,
  color = '#38bdf8',
  trackColor = 'rgba(255, 255, 255, 0.08)',
  showLabel = true,
  labelText,
  subLabel,
  className = '',
}) => {
  const clamped = Math.max(0, Math.min(100, percentage));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (clamped / 100) * circumference;

  return (
    <div
      className={`donut-progress-container ${className}`}
      style={{
        position: 'relative',
        width: size,
        height: size,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      role="progressbar"
      aria-valuenow={Math.round(clamped)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{ transform: 'rotate(-90deg)', overflow: 'visible' }}
      >
        {/* Track Circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={trackColor}
          strokeWidth={strokeWidth}
        />
        {/* Progress Circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          style={{
            transition: 'stroke-dashoffset 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        />
      </svg>
      {showLabel && (
        <div
          style={{
            position: 'absolute',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            lineHeight: 1,
            pointerEvents: 'none',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: size > 80 ? '1.4rem' : size > 40 ? '0.85rem' : '0.65rem',
              color: 'var(--text-main)',
            }}
          >
            {labelText !== undefined ? labelText : `${Math.round(clamped)}%`}
          </span>
          {subLabel && size >= 70 && (
            <span
              style={{
                fontSize: '0.65rem',
                color: 'var(--text-dim)',
                marginTop: '2px',
              }}
            >
              {subLabel}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
