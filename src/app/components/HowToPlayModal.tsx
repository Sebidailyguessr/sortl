"use client";

import { useEffect, useState } from "react";
import { trackEvent } from "@/utils/trackEvent";

interface HowToPlayModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type DismissMethod = "close_button" | "backdrop" | "escape" | "play";

const STEPS = [
  { icon: "🧪", title: "Select a tube",     desc: "Click a source tube to select the top layer." },
  { icon: "💧", title: "Pour it",            desc: "Click a destination tube to pour it." },
  { icon: "✅", title: "Follow the rules",   desc: "You can only pour onto the same colour or into an empty tube." },
  { icon: "🏆", title: "Solve efficiently",  desc: "Solve in as few moves as possible. One shot per day." },
];

const POUR_RULES = [
  { icon: "🎨", title: "Same colour",   desc: "You can only pour onto a matching colour at the top of the destination tube." },
  { icon: "🫙", title: "Empty tubes",   desc: "Any colour can be poured into a completely empty tube — use them as buffers." },
  { icon: "⚡", title: "Pour in runs",  desc: "Multiple same-colour layers at the top move together as one efficient move." },
];

const SCORING: [string, string][] = [
  ["≤ par",    "FLAWLESS SORT"],
  ["par +1–3", "CLEAN SORT"],
  ["par +4–8", "DECENT SORT"],
  ["par +9+",  "MESSY SORT"],
  ["stuck",    "UNSORTED"],
];

export default function HowToPlayModal({ isOpen, onClose }: HowToPlayModalProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isOpen) setVisible(true);
  }, [isOpen]);

  const handleClose = (method: DismissMethod) => {
    trackEvent("onboarding_dismissed", { game: "sl", method });
    setVisible(false);
    setTimeout(onClose, 150);
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") handleClose("escape"); };
    if (isOpen) window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen]);

  if (!isOpen && !visible) return null;

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-black/40 transition-opacity duration-150 ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
        onClick={() => handleClose("backdrop")}
      />
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none transition-opacity duration-150 ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
      >
        <div
          className={`bg-[#f3e9d6] border border-dashed border-[rgba(42,31,21,0.18)] rounded-2xl max-w-md w-full max-h-[90dvh] flex flex-col shadow-2xl pointer-events-auto transition-transform duration-150 ${
            isOpen ? "scale-100" : "scale-95"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 pt-6 pb-5 shrink-0">
            <h2 className="text-[#2a1f15] text-xl font-bold tracking-wide">How to Play</h2>
            <button
              onClick={() => handleClose("close_button")}
              className="text-[#8a7355] hover:text-[#2a1f15] transition-colors text-2xl leading-none"
              aria-label="Close"
            >
              ×
            </button>
          </div>

          {/* Scrollable body */}
          <div className="overflow-y-auto flex-1 px-6 pb-6">

            {/* Steps */}
            <ol className="space-y-3 mb-5">
              {STEPS.map((step, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="text-xl mt-0.5 shrink-0">{step.icon}</span>
                  <div>
                    <span className="text-[#2a1f15] font-semibold text-sm">{step.title}</span>
                    <p className="text-[#5a4632] text-sm leading-snug">{step.desc}</p>
                  </div>
                </li>
              ))}
            </ol>

            {/* POUR RULES (Sortl-specific) */}
            <div className="bg-[#ebdfc4] rounded-xl p-4 mb-5 border border-dashed border-[rgba(42,31,21,0.18)]">
              <p className="text-[#5a4632] text-xs font-semibold uppercase tracking-widest mb-3 font-mono">Pour Rules</p>
              <div className="space-y-2.5">
                {POUR_RULES.map(({ icon, title, desc }) => (
                  <div key={title} className="flex items-start gap-3 text-sm">
                    <span className="shrink-0 mt-0.5">{icon}</span>
                    <div>
                      <span className="text-[#2a1f15] font-semibold text-xs">{title}</span>
                      <p className="text-[#5a4632] text-xs leading-snug">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* SCORING */}
            <div className="bg-[#ebdfc4] rounded-xl p-4 mb-5 border border-dashed border-[rgba(42,31,21,0.18)]">
              <p className="text-[#5a4632] text-xs font-semibold uppercase tracking-widest mb-1 font-mono">Scoring</p>
              <p className="text-xs text-[#8a7355] font-mono mb-3">Par = minimum moves to solve today&apos;s puzzle.</p>
              <div className="space-y-1">
                {SCORING.map(([condition, label]) => (
                  <div key={condition} className="flex items-center text-sm gap-3">
                    <span className="text-[#8a7355] w-20 shrink-0 font-mono text-xs">{condition}</span>
                    <span className="text-[#2a1f15] font-semibold">{label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA */}
            <button
              onClick={() => handleClose("play")}
              className="w-full bg-[#c45a3a] hover:bg-[#a14628] text-white font-bold py-3 rounded-xl transition-colors text-sm tracking-wide"
            >
              Sort today&apos;s puzzle → 🧪
            </button>

            {/* Footer */}
            <p className="text-center text-xs text-[#8a7355] font-mono mt-4">
              Part of{" "}
              <a
                href="https://stoop.games"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#c45a3a] hover:underline"
              >
                Stoop
              </a>
              {" "}— 6 daily puzzle games
            </p>

          </div>
        </div>
      </div>
    </>
  );
}
