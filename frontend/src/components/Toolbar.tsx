import type { FigureType, ToolDef, StrokeSize } from "../types";
import { ToolButton } from "./ToolButton";
import { ColorSwatch } from "./ColorSwatch";
import { SizeButton } from "./SizeButton";

const PALETTE = [
  "#111111",
  "#6366f1",
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#3b82f6",
  "#ec4899",
  "#fff",
];

const STROKE_SIZES: StrokeSize[] = [
  { value: 2, dot: 5 },
  { value: 5, dot: 9 },
  { value: 14, dot: 14 },
  { value: 24, dot: 19 },
  { value: 40, dot: 24 },
];

const TOOLS: ToolDef[] = [
  {
    id: "brush",
    label: "Pincel",
    Icon: () => (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
        <path d="m15 5 4 4" />
      </svg>
    ),
  },
  {
    id: "circle",
    label: "Círculo",
    Icon: () => (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="9" />
      </svg>
    ),
  },
  {
    id: "rectangle",
    label: "Retângulo",
    Icon: () => (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="5" width="18" height="14" rx="2" />
      </svg>
    ),
  },
];

interface Props {
  tool: FigureType;
  setTool: (t: FigureType) => void;
  color: string;
  setColor: (c: string) => void;
  strokeWidth: number;
  setStrokeWidth: (s: number) => void;
}

export function Toolbar({
  tool,
  setTool,
  color,
  setColor,
  strokeWidth,
  setStrokeWidth,
}: Props) {
  return (
    <div className="fixed left-4 top-1/2 -translate-y-1/2 flex flex-col items-center gap-1 bg-[rgba(13,13,24,0.94)] backdrop-blur-xl rounded-[20px] py-3 px-[10px] z-[100] shadow-[0_8px_40px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.06)]">
      <div className="h-px" />

      {TOOLS.map((t) => (
        <ToolButton
          key={t.id}
          tool={t}
          active={tool === t.id}
          onClick={() => setTool(t.id)}
        />
      ))}

      <div className="w-7 h-px bg-white/10 my-1.5 flex-shrink-0" />

      {PALETTE.map((c) => (
        <ColorSwatch
          key={c}
          color={c}
          active={color === c}
          onClick={() => setColor(c)}
        />
      ))}

      {tool === "brush" ? (
        <>
          <div className="w-7 h-px bg-white/10 my-1.5 flex-shrink-0" />
          {STROKE_SIZES.map((s) => (
            <SizeButton
              key={s.value}
              size={s}
              active={strokeWidth === s.value}
              onClick={() => setStrokeWidth(s.value)}
            />
          ))}
        </>
      ) : (
        <div className="h-1" />
      )}

      <div className="h-px" />
    </div>
  );
}
