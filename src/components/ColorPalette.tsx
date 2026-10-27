import React from 'react';
import type { FaceColor } from '../types';
import { ALL_COLORS, COLOR_HEX, COLOR_NAMES } from '../types';
import { Check } from 'lucide-react';

interface ColorPaletteProps {
  selectedColor: FaceColor;
  onSelectColor: (color: FaceColor) => void;
  counts: Record<FaceColor, number>;
}

export const ColorPalette: React.FC<ColorPaletteProps> = ({
  selectedColor,
  onSelectColor,
  counts,
}) => {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-3 flex flex-col items-center gap-1.5">
      {/* 6 Large Color Swatches Grid */}
      <div className="w-full grid grid-cols-6 gap-2 sm:gap-3.5">
        {ALL_COLORS.map(color => {
          const isSelected = selectedColor === color;
          const count = counts[color] || 0;
          const isFull = count === 9;

          return (
            <button
              key={color}
              type="button"
              onClick={() => onSelectColor(color)}
              title={`${COLOR_NAMES[color]}: ${count}/9 stickers`}
              className={`relative h-12 sm:h-14 md:h-16 rounded-md border-2 transition-all duration-150 flex flex-col items-center justify-between p-1 cursor-pointer shadow-sm ${
                isSelected
                  ? 'border-black ring-4 ring-sky-500 scale-105 z-10 shadow-md'
                  : 'border-[#333333] hover:scale-102 hover:border-black'
              }`}
              style={{ backgroundColor: COLOR_HEX[color] }}
            >
              {/* Top right icon */}
              <div className="w-full flex items-center justify-end px-0.5">
                {isFull && (
                  <span className="p-0.5 rounded-full bg-emerald-600 text-white shadow-xs">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </span>
                )}
              </div>

              {/* Count Indicator Pill */}
              <span
                className={`text-[10px] sm:text-xs font-mono font-bold px-1.5 py-0.2 rounded-full border shadow-xs ${
                  isFull
                    ? 'bg-emerald-900/90 text-emerald-300 border-emerald-400'
                    : 'bg-black/60 text-white border-white/30'
                }`}
              >
                {count}/9
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
