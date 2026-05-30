"use client";
import { forwardRef, useEffect, useRef, useState } from "react";
import { TubeState } from "@/lib/levels";

export const LAYER_H = { full: 40, compact: 30 } as const;
export const TUBE_W  = { full: 56, compact: 40 } as const;

interface TubeProps {
  tube: TubeState;
  capacity: number;
  selected: boolean;
  complete: boolean;
  pulsing?: boolean;
  onClick: () => void;
  invalid?: boolean;
  compact?: boolean;
}

const Tube = forwardRef<HTMLButtonElement, TubeProps>(function Tube(
  { tube, capacity, selected, complete, pulsing = false, onClick, invalid = false, compact = false },
  ref
) {
  const [shake, setShake] = useState(false);
  const prevInvalid = useRef(false);

  const lh = compact ? LAYER_H.compact : LAYER_H.full;
  const tw = compact ? TUBE_W.compact  : TUBE_W.full;

  useEffect(() => {
    if (invalid && !prevInvalid.current) {
      setShake(true);
      const t = setTimeout(() => setShake(false), 500);
      return () => clearTimeout(t);
    }
    prevInvalid.current = invalid;
  }, [invalid]);

  const layers = [...tube];
  const empty  = capacity - layers.length;

  const borderCls = selected
    ? "border-[--terracotta] -translate-y-3 shadow-lg shadow-[--terracotta]/30"
    : complete
    ? "border-[--terracotta]/70"
    : "border-[--ink]/20 hover:border-[--ink-soft]";

  const glowCls = complete && pulsing
    ? "tube-win-pulse"
    : complete
    ? "shadow-[0_0_14px_3px_rgba(196,90,58,0.35)]"
    : "";

  return (
    <button
      ref={ref}
      onClick={onClick}
      className={[
        "relative flex flex-col-reverse items-center",
        "rounded-b-3xl rounded-t-lg border-2 overflow-hidden",
        "transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[--terracotta]/60",
        borderCls,
        glowCls,
        shake ? "shake" : "",
      ].filter(Boolean).join(" ")}
      style={{ height: capacity * lh + 8, width: tw, background: "var(--paper-deep)" }}
      aria-label={`Tube with ${tube.length} of ${capacity} layers`}
    >
      {/* Filled layers — bottom first */}
      {layers.map((color, i) => (
        <div
          key={i}
          className="w-full layer-enter"
          style={{
            height: lh,
            background: color,
            borderTop: i < layers.length - 1 ? "1px solid rgba(0,0,0,0.09)" : undefined,
            borderRadius: i === 0 ? "0 0 18px 18px" : 0,
          }}
        />
      ))}

      {/* Empty slots */}
      {Array.from({ length: empty }).map((_, i) => (
        <div key={`e${i}`} style={{ height: lh, width: "100%" }} />
      ))}

      {/* Selected: top-layer highlight floats above */}
      {selected && tube.length > 0 && (
        <div
          className="absolute top-0 left-0 right-0 pointer-events-none"
          style={{
            height: lh,
            background: tube[tube.length - 1],
            opacity: 0.88,
            borderBottom: "2px solid rgba(255,255,255,0.45)",
          }}
        />
      )}
    </button>
  );
});

export default Tube;
