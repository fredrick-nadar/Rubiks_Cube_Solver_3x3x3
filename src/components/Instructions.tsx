import React from 'react';

export const Instructions: React.FC = () => {
  return (
    <section className="w-full flex flex-col mt-4">
      {/* Orange Instructions Banner */}
      <div className="bg-[#FF6D00] py-2.5 px-4 text-center shadow-md">
        <h2 className="text-xl sm:text-2xl font-black text-white italic tracking-wider drop-shadow-sm uppercase">
          Instructions
        </h2>
      </div>

      {/* Instructions Card Content */}
      <div className="w-full max-w-4xl mx-auto px-6 py-6 text-slate-800 text-sm sm:text-base leading-relaxed">
        <div className="bg-white rounded-xl border border-slate-300 p-5 sm:p-6 shadow-sm flex flex-col gap-4">
          <p className="font-semibold text-slate-900">
            Follow these 4 simple steps to enter your physical 3×3 Rubik’s Cube:
          </p>

          <ol className="list-decimal list-inside flex flex-col gap-2.5 text-slate-700 pl-1">
            <li className="leading-snug">
              <strong className="text-slate-900">Pick a color:</strong> Click one of the 6 color buttons in the top palette (Red, Blue, Yellow, Green, White, or Orange).
            </li>
            <li className="leading-snug">
              <strong className="text-slate-900">Color the 3D cube:</strong> Click or tap directly on any tile of the 3D cube to paint it with that color.
            </li>
            <li className="leading-snug">
              <strong className="text-slate-900">Turn the cube:</strong> Use the blue arrow buttons below the cube (or drag with your mouse/touch) to rotate the cube and color all six sides.
            </li>
            <li className="leading-snug">
              <strong className="text-slate-900">Click Solve:</strong> Once the 3D cube matches the physical cube in your hand, click the blue <strong>Solve!</strong> button.
            </li>
          </ol>

          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-600 flex items-center justify-between">
            <span>
              💡 <strong>Tip:</strong> Keep White on top and Green facing you as your reference while coloring.
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
