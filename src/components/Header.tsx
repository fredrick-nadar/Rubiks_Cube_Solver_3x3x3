import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="w-full flex flex-col">
      {/* Top Green Banner */}
      <div className="bg-[#2ABB2A] py-2.5 px-4 text-center shadow-md">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-white italic tracking-wider drop-shadow-sm uppercase">
          Rubik's Cube Solver 3x3x3
        </h1>
      </div>

      {/* Dark Sub-Toolbar */}
      <div className="bg-[#333333] py-1.5 px-4 flex items-center justify-center gap-2 text-xs text-slate-300">
        <span className="font-mono text-slate-400">
          Interactive 3D Virtual Cube &bull; Physical Registration &bull; Step-by-Step Guidance
        </span>
      </div>
    </header>
  );
};
