import { useState, useRef, useEffect } from "react";
import {
  animate,
  motion,
  MotionValue,
  useMotionValue,
  useTransform,
} from "framer-motion";
import useSound from "use-sound";

export interface IWheelSlice {
  // TODO: size: number;
  key: string;
  text: string;
}

type SpinWheelProps = {
  slices: IWheelSlice[];
  autoSpin?: boolean;
  spinDurationSeconds?: number;
  onSpinComplete: (slice: IWheelSlice) => void;
};

export default function SpinWheel({
  slices = [],
  spinDurationSeconds = 5,
  autoSpin = false,
  onSpinComplete,
}: SpinWheelProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState(300);
  const [isSpinning, setIsSpinning] = useState(false);
  const [hasAutoSpun, setHasAutoSpun] = useState(false);

  const sliceCount = Math.max(slices.length, 1);
  const sliceAngle = 360 / sliceCount;
  const minCircleRotations = 2;
  const maxCircleRotations = 5;

  // Motion values
  const rotationActive = useMotionValue(0); // active/manual spin
  const rotationPassive = useMotionValue(145); // slow idle spin

  // Combine active + passive safely
  const rotationCombined: MotionValue<number> = useTransform(
    [rotationActive, rotationPassive] as const,
    (values: number[]) => values[0] + values[1]
  );

  // load your sound file (e.g. "click.mp3")
  const [playTick] = useSound("src/assets/sounds/tick_2.mp3", {
    soundEnabled: true,
    volume: 0.1,
    playbackRate: 1.0,
  });

  // Update container size
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      const { width, height } = entry.contentRect;
      setSize(Math.min(width, height));
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const lastSlice = useRef<number>(0);
  useEffect(() => {
    const unsubscribe = rotationCombined.on("change", (angle) => {
      const normalized = ((angle % 360) + 360) % 360; // keep positive
      const currentSlice = Math.floor(normalized / sliceAngle);

      if (!isSpinning) {
        lastSlice.current = currentSlice;
        return;
      }

      if (currentSlice !== lastSlice.current && isSpinning) {
        lastSlice.current = currentSlice;
        playTick();
      }
    });
    return () => unsubscribe();
  }, [rotationCombined, isSpinning, sliceAngle, playTick]);

  // Passive idle rotation
  useEffect(() => {
    if (isSpinning) return;
    let last = performance.now();
    let rafId: number;

    const tick = (now: number) => {
      const delta = now - last;
      last = now;
      rotationPassive.set((rotationPassive.get() + delta * 0.01) % 360); // slow passive
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [isSpinning, rotationPassive]);

  // Spin function
  const spin = () => {
    if (isSpinning) return;
    setIsSpinning(true);

    const extraRotation =
      minCircleRotations * 360 + Math.random() * maxCircleRotations * 360;
    const newRotation = rotationActive.get() + extraRotation;

    animate(rotationActive, newRotation, {
      duration: spinDurationSeconds,
      ease: "anticipate",
    });

    setTimeout(() => {
      setIsSpinning(false);

      const normalizedRotation = ((rotationCombined.get() % 360) + 360) % 360;
      const tickAngle = 0; // right-side tick
      const selectedIndex =
        Math.floor(
          ((360 - normalizedRotation + tickAngle) % 360) / sliceAngle
        ) % sliceCount;

      const selectedName = slices[selectedIndex] ?? "";
      onSpinComplete?.(selectedName);
    }, spinDurationSeconds * 1000);
  };

  // Auto spin once
  useEffect(() => {
    if (autoSpin && !hasAutoSpun) {
      setTimeout(() => {
        spin();
        setHasAutoSpun(true);
      }, 500);
    }
  }, [autoSpin, hasAutoSpun]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full flex items-center justify-center"
    >
      {slices.length && (
        <>
          <motion.svg
            width={size}
            height={size}
            viewBox="0 0 360 360"
            style={{ rotate: rotationCombined }}
            className="rounded-full border-2 border-gray-900 bg-black cursor-pointer"
            onClick={spin}
          >
            <g transform={`translate(180,180)`}>
              {Array.from({ length: sliceCount }).map((_, i) => {
                const start = i * sliceAngle;
                const end = start + sliceAngle;
                const mid = start + sliceAngle / 2;
                const r = 180;

                const x1 = r * Math.cos((Math.PI * start) / 180);
                const y1 = r * Math.sin((Math.PI * start) / 180);
                const x2 = r * Math.cos((Math.PI * end) / 180);
                const y2 = r * Math.sin((Math.PI * end) / 180);
                const path = `M0,0 L${x1},${y1} A${r},${r} 0 ${sliceAngle > 180 ? 1 : 0},1 ${x2},${y2} Z`;

                const label = slices[i].text ?? "";
                const fontSize = Math.max(
                  8,
                  Math.min(22, 120 / (label.length + 1))
                );

                return (
                  <g key={i}>
                    <path
                      d={path}
                      fill={`hsl(${(i * 360) / sliceCount}, 100%, 28%)`}
                      stroke="#fff"
                      strokeWidth={1}
                    />
                    {label && (
                      <g
                        transform={`rotate(${mid}) translate(${r * 0.62},0) rotate(${-90})`}
                      >
                        <text
                          textAnchor="middle"
                          alignmentBaseline="middle"
                          fontSize={fontSize}
                          fontWeight={700}
                          transform="rotate(90)"
                          fill="#fff"
                          style={{ userSelect: "none", pointerEvents: "none" }}
                        >
                          {label}
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}
            </g>
          </motion.svg>
          <svg
            width={size}
            height={size}
            viewBox="0 0 360 360"
            className="absolute pointer-events-none"
          >
            <polygon
              className="z-10"
              points="360,190 355,185 320,180 355,175 360,170"
              fill="white"
            />
          </svg>
        </>
      )}
    </div>
  );
}
