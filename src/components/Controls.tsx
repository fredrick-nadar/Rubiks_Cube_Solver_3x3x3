import React from 'react';
import { Undo2, CornerUpLeft, ArrowUp, CornerUpRight, Maximize2, Sparkles, Shuffle } from 'lucide-react';

interface ControlsProps {
  onReset: () => void;
  onScramble: () => void;
  onTurnLeft: () => void;
  onTiltUp: () => void;
  onTurnRight: () => void;
  onSolve: () => void;
  onToggleFullscreen: () => void;
}

export const Controls: React.FC<ControlsProps> = ({
  onReset,
  onScramble,
  onTurnLeft,
  onTiltUp,
  onTurnRight,
  onSolve,
  onToggleFullscreen,
}) => {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-2 sm:gap-4 select-none">
      {/* Left: Reset and Scramble Buttons */}
      <div className="flex items-center gap-2">
        <button
          id="reset-cube-button"
          type="button"
          onClick={onReset}
          title="Reset cube back to unpainted/white state"
          className="px-3.5 sm:px-5 py-2.5 rounded-md bg-[#3579DE] hover:bg-[#2563EB] active:bg-[#1D4ED8] text-white font-semibold text-xs sm:text-sm shadow transition cursor-pointer flex items-center gap-1.5"
        >
          <Undo2 className="w-4 h-4" />
          <span>Reset</span>
        </button>

        <button
          id="scramble-cube-button"
          type="button"
          onClick={onScramble}
          title="Scramble the cube with a valid random sequence"
          className="px-3.5 sm:px-5 py-2.5 rounded-md bg-[#E67E22] hover:bg-[#D35400] active:bg-[#BA4A00] text-white font-bold text-xs sm:text-sm shadow transition cursor-pointer flex items-center gap-1.5"
        >
          <Shuffle className="w-4 h-4" />
          <span>Scramble</span>
        </button>
      </div>

      {/* Center: Three Cube Turn Buttons */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        <button
          id="turn-left-button"
          type="button"
          onClick={onTurnLeft}
          title="Turn cube to the left"
          className="p-2 sm:p-2.5 rounded-md bg-[#3579DE] hover:bg-[#2563EB] active:bg-[#1D4ED8] text-white shadow transition cursor-pointer"
        >
          <CornerUpLeft className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        <button
          id="tilt-up-button"
          type="button"
          onClick={onTiltUp}
          title="Tilt cube up"
          className="p-2 sm:p-2.5 rounded-md bg-[#3579DE] hover:bg-[#2563EB] active:bg-[#1D4ED8] text-white shadow transition cursor-pointer"
        >
          <ArrowUp className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        <button
          id="turn-right-button"
          type="button"
          onClick={onTurnRight}
          title="Turn cube to the right"
          className="p-2 sm:p-2.5 rounded-md bg-[#3579DE] hover:bg-[#2563EB] active:bg-[#1D4ED8] text-white shadow transition cursor-pointer"
        >
          <CornerUpRight className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
      </div>

      {/* Right: Fullscreen & Solve! Buttons */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        <button
          id="fullscreen-button"
          type="button"
          onClick={onToggleFullscreen}
          title="Toggle Fullscreen"
          className="p-2.5 rounded-md bg-[#3579DE] hover:bg-[#2563EB] active:bg-[#1D4ED8] text-white shadow transition cursor-pointer hidden sm:block"
        >
          <Maximize2 className="w-5 h-5" />
        </button>

        <button
          id="solve-cube-button"
          type="button"
          onClick={onSolve}
          title="Check cube state and solve"
          className="px-5 sm:px-7 py-2.5 rounded-md bg-[#3579DE] hover:bg-[#2563EB] active:bg-[#1D4ED8] text-white font-bold text-sm sm:text-base shadow transition cursor-pointer flex items-center gap-1.5"
        >
          <Sparkles className="w-4 h-4 fill-white" />
          <span>Solve!</span>
        </button>
      </div>
    </div>
  );
};
