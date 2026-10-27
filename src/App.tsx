import React, { useState, useRef, useMemo, useCallback } from 'react';
import type { FaceId, FaceColor } from './types';
import { COLOR_NAMES } from './types';
import { createFreshBlankFacelets, createSolvedFacelets, validateCube } from './cubeModel';
import { applyMove } from './core/cubeSimulator';
import { Header } from './components/Header';
import { ColorPalette } from './components/ColorPalette';
import { Cube3D } from './components/Cube3D';
import type { Cube3DRef } from './components/Cube3D';
import { Controls } from './components/Controls';
import { Instructions } from './components/Instructions';
import { SolveModal } from './components/SolveModal';
import { GuidedSolver } from './components/GuidedSolver';
import { solveCube } from './solver/solverService';
import type { SolveResponse } from './solver/solverService';
import { AlertCircle } from 'lucide-react';

export const App: React.FC = () => {
  const cubeRef = useRef<Cube3DRef>(null);

  // App mode: 'registration' (manual painting) vs 'solving' (step-by-step 3D guidance)
  const [appMode, setAppMode] = useState<'registration' | 'solving'>('registration');

  // 54-facelet state: all start completely blank (null) -> all counts start at 0
  const [facelets, setFacelets] = useState<Record<FaceId, (FaceColor | null)[]>>(() =>
    createFreshBlankFacelets()
  );

  // Calculated solution data for guided solver
  const [solutionData, setSolutionData] = useState<SolveResponse | null>(null);

  // Active painting color from top palette (starts with Red)
  const [selectedColor, setSelectedColor] = useState<FaceColor>('red');

  // Solve modal visibility
  const [isSolveModalOpen, setIsSolveModalOpen] = useState(false);

  // Limit alert notification (when trying to exceed 9 stickers)
  const [limitNotice, setLimitNotice] = useState<string | null>(null);

  // Real-time validation computation
  const validation = useMemo(() => validateCube(facelets), [facelets]);

  // Handle direct click-to-paint on 3D cube sticker with strict 9-sticker ceiling
  const handleStickerClick = useCallback((face: FaceId, index: number) => {
    setFacelets(prev => {
      const currentColor = prev[face][index];

      // 1. If clicking with the same color, toggle it back to blank (null)
      if (currentColor === selectedColor) {
        const nextList = [...prev[face]];
        nextList[index] = null;
        return {
          ...prev,
          [face]: nextList,
        };
      }

      // 2. If trying to add selectedColor, check if that color is already at capacity (9)
      if (validation.counts[selectedColor] >= 9) {
        setLimitNotice(`All 9 ${COLOR_NAMES[selectedColor]} stickers are already used!`);
        setTimeout(() => setLimitNotice(null), 3000);
        return prev; // Strictly block the action!
      }

      // 3. Apply color
      const nextList = [...prev[face]];
      nextList[index] = selectedColor;
      return {
        ...prev,
        [face]: nextList,
      };
    });
  }, [selectedColor, validation.counts]);

  // Reset cube back to completely blank state (all counts 0)
  const handleReset = useCallback(() => {
    setFacelets(createFreshBlankFacelets());
    setLimitNotice(null);
    cubeRef.current?.resetView();
  }, []);

  // Fill cube as solved template (all 9 of each color)
  const handleFillSolved = useCallback(() => {
    setFacelets(createSolvedFacelets());
    setLimitNotice(null);
  }, []);

  // Apply a sample valid scramble for quick testing / demonstration
  const handleScramble = useCallback(() => {
    const nextState = createSolvedFacelets();
    const faces = ['U', 'D', 'R', 'L', 'F', 'B'];
    const modifiers = ['', "'", '2'];
    const scrambleMoves: string[] = [];
    let lastFace = '';

    while (scrambleMoves.length < 15) {
      const face = faces[Math.floor(Math.random() * faces.length)];
      if (face === lastFace) continue;
      const mod = modifiers[Math.floor(Math.random() * modifiers.length)];
      scrambleMoves.push(`${face}${mod}`);
      lastFace = face;
    }

    for (const m of scrambleMoves) {
      applyMove(nextState, m);
    }
    setFacelets(nextState);
    setLimitNotice(null);
  }, []);

  // Execute solver and transition to guided solving mode
  const handleStartSolving = useCallback(() => {
    const solution = solveCube(facelets);
    if (solution.success) {
      setSolutionData(solution);
      setIsSolveModalOpen(false);
      setAppMode('solving');
    } else {
      setIsSolveModalOpen(true);
    }
  }, [facelets]);

  // Handle clicking the "Solve!" button in the control bar
  const handleSolveButtonClick = useCallback(() => {
    if (validation.isValid) {
      handleStartSolving();
    } else {
      setIsSolveModalOpen(true);
    }
  }, [validation.isValid, handleStartSolving]);

  // Fullscreen toggle
  const handleToggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#DFDFDF] flex flex-col font-sans text-slate-800 selection:bg-emerald-500 selection:text-white">
      {/* 1. Top Green Banner & Subhead */}
      <Header />

      {appMode === 'registration' ? (
        <>
          {/* 2. Top 6-Color Palette Bar (Counts 0/9 to 9/9) */}
          <ColorPalette
            selectedColor={selectedColor}
            onSelectColor={setSelectedColor}
            counts={validation.counts}
          />

          {/* Floating Notice Toast if color capacity reached */}
          {limitNotice && (
            <div className="max-w-md mx-auto w-full px-4 mb-2 animate-fadeIn z-20">
              <div className="bg-amber-900/90 border border-amber-500/80 text-amber-100 text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl shadow-lg flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>{limitNotice}</span>
                </div>
                <button
                  onClick={() => setLimitNotice(null)}
                  className="text-xs text-amber-300 hover:text-white font-mono underline ml-2 cursor-pointer"
                >
                  OK
                </button>
              </div>
            </div>
          )}

          {/* 3. Central Interactive 3D Rubik's Cube with Direct Raycasting */}
          <main className="w-full flex-1 flex flex-col items-center justify-center relative">
            <div className="w-full max-w-4xl mx-auto shadow-inner border border-slate-300 rounded-lg overflow-hidden bg-[#DFDFDF]">
              <Cube3D
                ref={cubeRef}
                facelets={facelets}
                onStickerClick={handleStickerClick}
                interactive={true}
              />
            </div>

            {/* 4. Bottom Controls Bar: Reset, Arrow Buttons, Solve! */}
            <Controls
              onReset={handleReset}
              onScramble={handleScramble}
              onTurnLeft={() => cubeRef.current?.turnLeft()}
              onTiltUp={() => cubeRef.current?.tiltUp()}
              onTurnRight={() => cubeRef.current?.turnRight()}
              onSolve={handleSolveButtonClick}
              onToggleFullscreen={handleToggleFullscreen}
            />
          </main>

          {/* 5. Orange Banner Instructions Section */}
          <Instructions />

          {/* 6. Solve / Validation Result Modal */}
          <SolveModal
            isOpen={isSolveModalOpen}
            validation={validation}
            onClose={() => setIsSolveModalOpen(false)}
            onFillSolved={handleFillSolved}
            onScramble={handleScramble}
            onStartSolving={handleStartSolving}
          />

        </>
      ) : (
        /* Dedicated Phase 2 Guided Solving View */
        <main className="w-full flex-1 flex flex-col items-center justify-start py-2">
          {solutionData && (
            <GuidedSolver
              initialFacelets={facelets}
              moves={solutionData.moves}
              stepStates={solutionData.stepStates}
              isAlreadySolved={solutionData.isAlreadySolved}
              onExitToRegistration={() => setAppMode('registration')}
            />
          )}
        </main>
      )}

      {/* Footer */}
      <footer className="w-full py-3 bg-[#333333] text-center text-xs text-slate-400 font-mono">
        Rubik’s Cube 3×3×3 Interactive Solver &bull; Manual Physical Registration &amp; Step-by-Step 3D Guidance
      </footer>
    </div>
  );
};

export default App;
