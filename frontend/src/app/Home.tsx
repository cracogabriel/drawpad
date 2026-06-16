import { useState } from "react";
import { useNavigate } from "react-router-dom";

function ArrowIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path
        d="M5 12h14M12 5l7 7-7 7"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function Home() {
  const [value, setValue] = useState("");
  const navigate = useNavigate();

  const enter = () => {
    const name = value.trim().toLowerCase().replace(/\s+/g, "-");
    if (name) navigate(`/${encodeURIComponent(name)}`);
  };

  return (
    <div className="w-screen h-screen flex flex-col bg-white overflow-hidden">
      <header className="px-9 py-7 animate-[fadeIn_0.5s_ease_forwards]">
        <span className="text-[13px] font-semibold tracking-[0.1em] text-[#c8c8c8] lowercase select-none">
          drawpad
        </span>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center pb-16">
        <div className="flex flex-col items-center gap-2.5 mb-12 animate-[fadeIn_0.7s_ease_forwards]">
          <h1 className="text-[72px] font-extralight tracking-[-0.04em] text-[#111111] leading-none">
            drawpad
          </h1>
          <p className="text-[13px] font-normal text-[#c0c0c0] tracking-[0.05em]">
            quadro colaborativo em tempo real
          </p>
        </div>

        <div className="flex items-center w-[400px] border-b-[1.5px] border-[#e5e5e5] focus-within:border-indigo-500 transition-colors duration-200 opacity-0 animate-[fadeUp_0.65s_cubic-bezier(0.16,1,0.3,1)_0.1s_forwards]">
          <input
            className="flex-1 border-none outline-none bg-transparent text-[22px] font-light text-[#111111] py-3.5 tracking-[-0.01em] min-w-0"
            type="text"
            placeholder="nome da sala..."
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && enter()}
            autoFocus
            autoComplete="off"
            spellCheck={false}
          />
          <button
            onClick={enter}
            aria-label="Entrar na sala"
            className="w-[38px] h-[38px] rounded-full bg-indigo-500 hover:bg-indigo-600 text-white flex items-center justify-center flex-shrink-0 ml-3 transition-all duration-150 hover:scale-105"
          >
            <ArrowIcon />
          </button>
        </div>

        <p className="mt-4 text-xs text-[#d8d8d8] tracking-[0.02em] opacity-0 animate-[fadeIn_0.8s_ease_0.4s_forwards]">
          pressione Enter ou clique na seta
        </p>
      </main>

      <footer className="py-5 text-center text-[11px] text-[#e0e0e0] tracking-[0.03em] opacity-0 animate-[fadeIn_1s_ease_0.6s_forwards]">
        <span>acesse qualquer sala pelo nome — sem cadastro</span>
      </footer>
    </div>
  );
}
