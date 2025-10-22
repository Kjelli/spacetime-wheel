import { useEffect, useState } from "react";

type Props = {
  duration: number; // seconds
  size?: number; // px
  color?: string; // fill color
  onComplete?: () => void;
};

export default function CountdownCircle({
  duration,
  size = 200,
  color = "#2563eb",
  onComplete,
}: Props) {
  const [elapsed, setElapsed] = useState(0);
  const [elapsedLinear, setElapsedLinear] = useState(0);

  useEffect(() => {
    let start: number | null = null;
    let animationId: number;

    const step = (timestamp: number) => {
      if (!start) start = timestamp;
      const delta = timestamp - start;
      const seconds = delta / 1000;

      const t = Math.min(seconds / duration, 1);
      setElapsed(t * duration);
      setElapsedLinear(Math.max(duration - Math.ceil(seconds), 0));

      if (seconds < duration) {
        animationId = requestAnimationFrame(step);
      } else {
        if (onComplete) onComplete();
      }
    };

    animationId = requestAnimationFrame(step);

    return () => cancelAnimationFrame(animationId);
  }, [duration, onComplete]);

  const fraction = 1 - Math.min(elapsed / duration, 1);
  const r = size / 2;

  const getSectorPath = (fraction: number) => {
    const angle = fraction * 360;
    if (angle <= 0) return "";
    if (angle >= 360)
      return `M${r},${r} m-${r},0 a ${r},${r} 0 1,0 ${r * 2},0 a ${r},${r} 0 1,0 -${r * 2},0`;

    const radians = (Math.PI / 180) * angle;
    const x = r + r * Math.sin(radians);
    const y = r - r * Math.cos(radians);
    const largeArcFlag = angle > 180 ? 1 : 0;
    return `M${r},${r} L${r},0 A${r},${r} 0 ${largeArcFlag},1 ${x},${y} Z`;
  };

  return (
    <div style={{ width: size, height: size, position: "relative" }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <path d={getSectorPath(fraction)} fill={color} />
      </svg>

      {/* numeric overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: Math.max(12, size * 0.2),
          fontWeight: 700,
          color: "#fff",
          pointerEvents: "none",
          userSelect: "none",
        }}
      >
        {Math.ceil(elapsedLinear)}
      </div>
    </div>
  );
}
