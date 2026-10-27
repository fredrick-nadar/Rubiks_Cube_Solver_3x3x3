import React from 'react';
import type { ValidationResult } from '../types';
import { CheckCircle2, AlertTriangle, X, Play } from 'lucide-react';

interface SolveModalProps {
  isOpen: boolean;
  validation: ValidationResult;
  onClose: () => void;
  onFillSolved: () => void;
  onScramble: () => void;
  onStartSolving: () => void;
}

export const SolveModal: React.FC<SolveModalProps> = ({
  isOpen,
  validation,
  onClose,
  onFillSolved,
  onScramble,
  onStartSolving,
}) => {
  if (!isOpen) return null;

  const { isValid, errors } = validation;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-2xl border border-slate-300 max-w-lg w-full p-6 shadow-2xl text-slate-800 relative flex flex-col gap-4">
        {/* Close Icon */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3">
          <div
            className={`p-2.5 rounded-xl ${
              isValid ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
            }`}
          >
            {isValid ? (
              <CheckCircle2 className="w-7 h-7" />
            ) : (
              <AlertTriangle className="w-7 h-7" />
            )}
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              {isValid ? 'Cube Verified & Ready to Solve!' : 'Check Your Rubik’s Cube'}
            </h3>
            <p className="text-xs text-slate-500">
              {isValid
                ? 'All physical constraints and parity checks passed'
                : 'The entered colors do not form a valid Rubik’s cube'}
            </p>
          </div>
        </div>

        {/* Body Content */}
        {isValid ? (
          <div className="flex flex-col gap-3 py-2 text-sm text-slate-700">
            <p className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 text-emerald-900 leading-relaxed text-xs sm:text-sm">
              🎉 <strong>Ready!</strong> All 54 stickers on your 3D cube match a physically valid 3×3 Rubik's Cube state. We will now compute the step-by-step 3D solution for your exact cube.
            </p>
            <div className="bg-sky-50 border border-sky-200 rounded-xl p-3 text-xs text-sky-900 flex flex-col gap-1">
              <span className="font-bold">What to expect:</span>
              <p>
                • Step-by-step 3D face turn animations for every move.
              </p>
              <p>
                • Plain-language instructions for your physical cube.
              </p>
              <p>
                • Fixed physical reference (White on Top, Green in Front).
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3 py-2 text-sm">
            <p className="text-slate-600">
              Please correct the following issue{errors.length > 1 ? 's' : ''} on your cube:
            </p>
            <ul className="list-disc list-inside bg-amber-50 border border-amber-200 rounded-xl p-4 flex flex-col gap-1.5 text-xs text-amber-900 font-medium max-h-48 overflow-y-auto">
              {errors.map((err, idx) => (
                <li key={idx} className="leading-relaxed">
                  {err}
                </li>
              ))}
            </ul>
            <div className="flex flex-col gap-1.5 pt-1 text-xs text-slate-500">
              <div className="flex items-center justify-between">
                <span>Want to start from a solved cube template?</span>
                <button
                  id="modal-fill-solved-button"
                  type="button"
                  onClick={() => {
                    onFillSolved();
                    onClose();
                  }}
                  className="text-sky-600 hover:text-sky-800 font-semibold underline cursor-pointer"
                >
                  Fill Solved Cube
                </button>
              </div>
              <div className="flex items-center justify-between">
                <span>Want to test with a valid scrambled cube?</span>
                <button
                  id="modal-scramble-button"
                  type="button"
                  onClick={() => {
                    onScramble();
                    onClose();
                  }}
                  className="text-amber-700 hover:text-amber-900 font-semibold underline cursor-pointer"
                >
                  Load Sample Scramble
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
          <button
            id="modal-close-button"
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-semibold text-xs transition cursor-pointer"
          >
            {isValid ? 'Close' : 'Got It, Let Me Fix It'}
          </button>

          {isValid && (
            <button
              id="modal-solve-my-cube-button"
              data-testid="modal-solve-my-cube-button"
              type="button"
              onClick={() => {
                onClose();
                onStartSolving();
              }}
              className="px-6 py-2.5 rounded-xl bg-[#2ABB2A] hover:bg-[#239E23] text-white font-bold text-sm shadow transition cursor-pointer flex items-center gap-1.5"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Solve My Cube</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
