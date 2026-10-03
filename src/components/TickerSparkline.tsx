import React from "react";

interface TickerSparklineProps {
  data: number[];
  isPositive: boolean;
  width?: number;
  height?: number;
  strokeWidth?: number;
  showGradient?: boolean;
}

export const TickerSparkline: React.FC<TickerSparklineProps> = ({
  data,
  isPositive,
  width = 64,
  height = 24,
  strokeWidth = 1.5,
  showGradient = false,
}) => {
  if (!data || data.length < 2) {
    return <div style={{ width, height }} className="bg-slate-800/30 rounded" />;
  }

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min === 0 ? 1 : max - min;
  const padding = 2;
  const effectiveHeight = height - padding * 2;
  const effectiveWidth = width - padding * 2;

  const points = data.map((val, idx) => {
    const x = padding + (idx / (data.length - 1)) * effectiveWidth;
    const y = padding + effectiveHeight - ((val - min) / range) * effectiveHeight;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  const pathD = `M ${points.join(" L ")}`;
  const strokeColor = isPositive ? "#34d399" : "#f43f5e"; // emerald-400 vs rose-500
  const gradientId = `spark-grad-${Math.random().toString(36).substr(2, 9)}`;

  // Area under curve if gradient is requested
  const areaD = `${pathD} L ${width - padding},${height} L ${padding},${height} Z`;

  return (
    <svg width={width} height={height} className="overflow-visible shrink-0">
      {showGradient && (
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={strokeColor} stopOpacity={0.25} />
            <stop offset="100%" stopColor={strokeColor} stopOpacity={0.0} />
          </linearGradient>
        </defs>
      )}
      {showGradient && (
        <path d={areaD} fill={`url(#${gradientId})`} />
      )}
      <path
        d={pathD}
        fill="none"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
