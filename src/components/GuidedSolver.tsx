import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { FaceId, FaceColor } from '../types';
import { Cube3D } from './Cube3D';
import type { Cube3DRef } from './Cube3D';
import { getMoveInstruction, FIXED_REFERENCE_TEXT } from '../solver/moveInstructions';
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Play,
  Compass,
  Sparkles,
  ArrowLeft,
  ShieldAlert,
} from 'lucide-react';

interface GuidedSolverProps {
  initialFacelets: Record<FaceId, (FaceColor | null)[]>;
  moves: string[];
  stepStates: Record<FaceId, (FaceColor | null)[]>[];
  isAlreadySolved: boolean;
  onExitToRegistration: () => void;
}

export const GuidedSolver: React.FC<GuidedSolverProps> = ({
  moves,
  stepStates,
  isAlreadySolved,
  onExitToRegistration,
}) => {
  const cubeRef = useRef<Cube3DRef>(null);

  // currentStepIndex: 0 to moves.length
  // 0 means ready to perform Move 1
  // moves.length means all moves completed
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);

  const totalMoves = moves.length;
  const isComplete = isAlreadySolved || currentStepIndex >= totalMoves;

  // Active move and instruction
  const currentMove = !isComplete && totalMoves > 0 ? moves[currentStepIndex] : null;
  const instruction = currentMove ? getMoveInstruction(currentMove) : null;

  // Current display state for 3D cube
  const currentFacelets = stepStates[currentStepIndex] || stepStates[0];

  // Trigger 3D turn animation
  const triggerMoveAnimation = useCallback((stepIdx: number) => {
    if (!cubeRef.current) return;
    const move = moves[stepIdx];
    if (!move) return;

    const startState = stepStates[stepIdx];
    const targetState = stepStates[stepIdx + 1];

    if (startState) {
      cubeRef.current.setFacelets(startState);
    }

    setIsAnimating(true);
    cubeRef.current.animateFaceMove(move, targetState, () => {
      setIsAnimating(false);
    });
  }, [moves, stepStates]);

  // When step changes, automatically play the 3D move demonstration
  useEffect(() => {
    if (!isComplete && currentMove) {
      // Small delay to allow state to settle
      const timer = setTimeout(() => {
        triggerMoveAnimation(currentStepIndex);
      }, 150);
      return () => clearTimeout(timer);
    } else if (isComplete && cubeRef.current) {
      const solvedState = stepStates[totalMoves] || stepStates[0];
      if (solvedState) {
        cubeRef.current.setFacelets(solvedState);
      }
    }
  }, [currentStepIndex, currentMove, isComplete, triggerMoveAnimation, stepStates, totalMoves]);

  // Handle "I've Done This Move — Next"
  const handleNext = () => {
    if (isAnimating || isComplete) return;
    setCurrentStepIndex(prev => prev + 1);
  };

  // Handle "Previous Move"
  const handlePrevious = () => {
    if (isAnimating || currentStepIndex <= 0) return;
    setCurrentStepIndex(prev => prev - 1);
  };

  // Handle "Restart Solution"
  const handleRestart = () => {
    if (isAnimating) return;
    setCurrentStepIndex(0);
    cubeRef.current?.resetView();
  };

  // Handle "Replay Animation"
  const handleReplay = () => {
    if (isAnimating || !currentMove) return;
    triggerMoveAnimation(currentStepIndex);
  };

  const progressPercent = totalMoves > 0
    ? Math.round((currentStepIndex / totalMoves) * 100)
    : 100;

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-3 px-3 sm:px-4 py-2 select-none animate-fadeIn">
      {/* 1. Top Navigation & Header */}
      <div className="flex items-center justify-between border-b border-slate-300 pb-2">
        <button
          id="back-to-registration-button"
          type="button"
          onClick={onExitToRegistration}
          className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-300 px-3 py-1.5 rounded-lg shadow-xs transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Registration</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold text-slate-600 bg-slate-200/80 px-2.5 py-1 rounded-md">
            {isComplete ? 'Solved' : `Step ${currentStepIndex + 1} of ${totalMoves}`}
          </span>
          <span className="text-xs font-mono font-semibold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-md">
            {progressPercent}% Complete
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden shadow-inner">
        <div
          className="bg-emerald-500 h-full transition-all duration-300 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* 2. Fixed Physical Orientation Bar */}
      <div className="bg-sky-50 border border-sky-200 rounded-xl p-2.5 flex items-center justify-between gap-2 text-xs text-sky-900">
        <div className="flex items-center gap-2">
          <Compass className="w-4 h-4 text-sky-600 shrink-0" />
          <span className="font-semibold">Physical Cube Reference:</span>
          <span>{FIXED_REFERENCE_TEXT}</span>
        </div>
        <span className="hidden md:inline text-[11px] text-sky-700 font-mono italic">
          (Do not rotate whole cube)
        </span>
      </div>

      {/* 3. Main Stage: 3D Viewport + Move Instruction Card */}
      {!isComplete && instruction && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-stretch">
          {/* Left/Main Column: 3D Animated Cube */}
          <div className="md:col-span-7 bg-[#DFDFDF] border border-slate-300 rounded-xl overflow-hidden shadow-inner flex flex-col relative">
            <Cube3D
              ref={cubeRef}
              facelets={currentFacelets}
              activeFaceHighlight={instruction.face}
              interactive={false}
            />

            {/* Quick 3D View Helpers */}
            <div className="absolute bottom-2 left-2 flex items-center gap-1 z-10">
              <button
                type="button"
                onClick={() => cubeRef.current?.turnLeft()}
                title="Turn 3D camera left"
                className="bg-black/50 hover:bg-black/70 text-white text-[11px] font-mono px-2 py-1 rounded backdrop-blur-xs transition cursor-pointer"
              >
                ↰ Turn Left
              </button>
              <button
                type="button"
                onClick={() => cubeRef.current?.tiltUp()}
                title="Tilt 3D camera up"
                className="bg-black/50 hover:bg-black/70 text-white text-[11px] font-mono px-2 py-1 rounded backdrop-blur-xs transition cursor-pointer"
              >
                ↱ Tilt Up
              </button>
              <button
                type="button"
                onClick={() => cubeRef.current?.turnRight()}
                title="Turn 3D camera right"
                className="bg-black/50 hover:bg-black/70 text-white text-[11px] font-mono px-2 py-1 rounded backdrop-blur-xs transition cursor-pointer"
              >
                ↱ Turn Right
              </button>
              <button
                type="button"
                onClick={() => cubeRef.current?.resetView()}
                title="Reset 3D camera angle"
                className="bg-black/50 hover:bg-black/70 text-white text-[11px] font-mono px-2 py-1 rounded backdrop-blur-xs transition cursor-pointer"
              >
                Reset Angle
              </button>
            </div>
          </div>

          {/* Right Column: Beginner-Friendly Move Card */}
          <div className="md:col-span-5 bg-white border border-slate-300 rounded-xl p-4 shadow-sm flex flex-col justify-between gap-3">
            <div className="flex flex-col gap-2.5">
              {/* Move Notation Pill & Name */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-3xl font-black font-mono tracking-tight bg-slate-900 text-amber-400 px-3.5 py-1 rounded-xl shadow">
                    {instruction.notation}
                  </span>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 leading-tight">
                      {instruction.faceName}
                    </h3>
                    <p className="text-xs font-semibold text-slate-500">
                      {instruction.faceColor} center &bull; {instruction.angleDescription}
                    </p>
                  </div>
                </div>

                {/* Replay 3D Move Button */}
                <button
                  id="step-replay-button"
                  type="button"
                  onClick={handleReplay}
                  disabled={isAnimating}
                  title="Watch 3D animation again"
                  className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer disabled:opacity-50"
                >
                  <Play className="w-4 h-4 fill-slate-700" />
                </button>
              </div>

              {/* Plain-Language Step Directions */}
              <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-3 text-xs text-amber-950 flex flex-col gap-1.5">
                <span className="font-bold text-amber-900 uppercase tracking-wider text-[10px]">
                  How to turn your physical cube:
                </span>
                <p className="leading-relaxed font-medium">
                  {instruction.directViewDescription}
                </p>
                <p className="text-[11px] text-amber-800 italic pt-0.5 border-t border-amber-200/60">
                  Tip: {instruction.physicalActionDescription}
                </p>
              </div>

              {/* Physical Verification Caution */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-2 flex items-start gap-1.5 text-[11px] text-slate-500">
                <ShieldAlert className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                <span>
                  Perform this turn on your physical cube, then confirm below to advance.
                </span>
              </div>
            </div>

            {/* Stepper Navigation Buttons */}
            <div className="flex flex-col gap-2 pt-2 border-t border-slate-200">
              <button
                id="step-next-button"
                type="button"
                onClick={handleNext}
                disabled={isAnimating}
                className="w-full py-3 px-4 rounded-xl bg-[#2ABB2A] hover:bg-[#239E23] active:bg-[#1C821C] text-white font-bold text-sm sm:text-base shadow-md transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <span>I've Done This Move — Next</span>
                <ChevronRight className="w-5 h-5" />
              </button>

              <div className="flex items-center justify-between gap-2">
                <button
                  id="step-prev-button"
                  type="button"
                  onClick={handlePrevious}
                  disabled={isAnimating || currentStepIndex === 0}
                  className="flex-1 py-2 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition cursor-pointer flex items-center justify-center gap-1 disabled:opacity-40"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous Move</span>
                </button>

                <button
                  id="step-restart-button"
                  type="button"
                  onClick={handleRestart}
                  disabled={isAnimating || currentStepIndex === 0}
                  className="py-2 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold text-xs transition cursor-pointer flex items-center gap-1 disabled:opacity-40"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Restart</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. Completion State Screen */}
      {isComplete && (
        <div className="bg-white border border-slate-300 rounded-2xl p-6 sm:p-8 shadow-md flex flex-col items-center text-center gap-4 animate-fadeIn">
          <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-inner">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="max-w-md flex flex-col gap-1">
            <h2 className="text-2xl font-black text-slate-900">
              {isAlreadySolved ? 'Your Cube is Already Solved!' : 'All Moves Completed! 🎉'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {isAlreadySolved
                ? 'The registered cube was already in a complete solved configuration. No moves were required.'
                : `You have completed all ${totalMoves} solution moves on your Rubik's Cube.`}
            </p>
          </div>

          {/* Solved 3D Cube View */}
          <div className="w-full max-w-sm h-64 bg-[#DFDFDF] border border-slate-200 rounded-xl overflow-hidden shadow-inner my-1">
            <Cube3D
              ref={cubeRef}
              facelets={currentFacelets}
              interactive={false}
            />
          </div>

          {/* Physical Verification Prompt */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 max-w-lg text-xs sm:text-sm text-emerald-950 text-left flex flex-col gap-1.5">
            <div className="flex items-center gap-2 font-bold text-emerald-900">
              <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Please physically verify all 6 faces of your cube:</span>
            </div>
            <ul className="list-disc list-inside text-xs text-emerald-900 space-y-0.5 ml-1">
              <li><strong>Top (White):</strong> All 9 white stickers solid.</li>
              <li><strong>Front (Green):</strong> All 9 green stickers solid.</li>
              <li><strong>Right (Red):</strong> All 9 red stickers solid.</li>
              <li><strong>Left (Orange):</strong> All 9 orange stickers solid.</li>
              <li><strong>Bottom (Yellow):</strong> All 9 yellow stickers solid.</li>
              <li><strong>Back (Blue):</strong> All 9 blue stickers solid.</li>
            </ul>
            <p className="text-[11px] text-emerald-700 italic pt-1 border-t border-emerald-200/60">
              Note: Digital guidance assumes accurate physical turns. If any face does not match, you can re-register your physical state to get a fresh solution.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              id="register-another-cube-button"
              type="button"
              onClick={onExitToRegistration}
              className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow transition cursor-pointer"
            >
              Register Another Cube
            </button>

            {totalMoves > 0 && (
              <button
                id="review-from-start-button"
                type="button"
                onClick={handleRestart}
                className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm transition cursor-pointer flex items-center gap-1.5"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Review Solution from Step 1</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
