import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Sortl — Daily liquid sort puzzle";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const TUBES = [
  ["#c45a3a", "#d49a3a", "#7a8a5e", "#6b4858"],
  ["#4a7a8a", "#c45a3a", "#8a6a3a", "#d49a3a"],
  ["#6b4858", "#7a8a5e", "#4a7a8a", "#8a6a3a"],
  ["#d49a3a", "#6b4858", "#c45a3a", "#7a8a5e"],
  [],
];

function OGTube({ layers, complete }: { layers: string[]; complete?: boolean }) {
  const TUBE_H = 180;
  const LAYER_H = TUBE_H / 4;
  return (
    <div
      style={{
        width: 64,
        height: TUBE_H + 16,
        borderRadius: "12px 12px 28px 28px",
        border: `3px solid ${complete ? "rgba(196,90,58,0.7)" : "rgba(42,31,21,0.25)"}`,
        background: "#e5d5b3",
        display: "flex",
        flexDirection: "column-reverse",
        overflow: "hidden",
        boxShadow: complete ? "0 0 18px 5px rgba(196,90,58,0.4)" : "none",
      }}
    >
      {layers.map((color, i) => (
        <div key={i} style={{ height: LAYER_H, background: color, width: "100%" }} />
      ))}
    </div>
  );
}

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          background: "#f3e9d6",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 40,
          fontFamily: "serif",
        }}
      >
        {/* Title */}
        <div
          style={{
            fontSize: 96,
            fontWeight: 700,
            color: "#c45a3a",
            letterSpacing: "-2px",
            lineHeight: 1,
          }}
        >
          Sortl
        </div>

        {/* Tubes */}
        <div style={{ display: "flex", gap: 16, alignItems: "flex-end" }}>
          {TUBES.map((layers, i) => (
            <OGTube key={i} layers={layers} complete={false} />
          ))}
        </div>

        {/* Tagline */}
        <div style={{ fontSize: 32, color: "#5a4632", marginTop: 8 }}>
          Sort the colours · A new puzzle every day
        </div>

        {/* Domain */}
        <div style={{ fontSize: 22, color: "#8a7355", marginTop: -12 }}>
          sortl.stoop.games
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
