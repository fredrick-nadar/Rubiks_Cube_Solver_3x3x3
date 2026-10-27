import type { FaceId, FaceColor } from '../types';
import { validateCube } from '../cubeModel';
import { isStateSolved, verifySolution } from '../core/cubeSimulator';
import Cube from './kociemba.js';

const CubeConstructor = Cube;

let isSolverInitialized = false;

/**
 * Initializes the Kociemba two-phase lookup tables.
 * Safe to call multiple times (cached).
 */
export function ensureSolverReady(): void {
  if (!isSolverInitialized) {
    if (typeof CubeConstructor.initSolver === 'function') {
      CubeConstructor.initSolver();
    }
    isSolverInitialized = true;
  }
}

export interface SolveResponse {
  success: boolean;
  isAlreadySolved: boolean;
  moves: string[];
  stepStates: Record<FaceId, (FaceColor | null)[]>[];
  error?: string;
}

/**
 * Solves a 54-facelet cube state using Herbert Kociemba's two-phase algorithm.
 * Guarantees that:
 * 1. Already solved cubes produce 0 moves.
 * 2. Any calculated solution is verified by virtual simulator before returning.
 * 3. Intermediate step states are prepared for step-by-step 3D guidance.
 */
export function solveCube(
  facelets: Record<FaceId, (FaceColor | null)[]>
): SolveResponse {
  // 1. Check if the cube is already solved
  if (isStateSolved(facelets)) {
    return {
      success: true,
      isAlreadySolved: true,
      moves: [],
      stepStates: [facelets],
    };
  }

  // 2. Validate physical validity
  const validation = validateCube(facelets);
  if (!validation.isValid || !validation.faceletString) {
    return {
      success: false,
      isAlreadySolved: false,
      moves: [],
      stepStates: [facelets],
      error: validation.errors[0] || 'Cube state is physically invalid.',
    };
  }

  // 3. Ensure lookup tables are initialized
  ensureSolverReady();

  // 4. Instantiate Cube from 54-char Singmaster string
  let cubeInstance;
  try {
    cubeInstance = CubeConstructor.fromString(validation.faceletString);
  } catch (err) {
    return {
      success: false,
      isAlreadySolved: false,
      moves: [],
      stepStates: [facelets],
      error: `Failed to parse cube state: ${(err as Error).message}`,
    };
  }

  // 5. Solve via Kociemba Two-Phase Algorithm
  let moveString = '';
  try {
    moveString = cubeInstance.solve();
  } catch (err) {
    return {
      success: false,
      isAlreadySolved: false,
      moves: [],
      stepStates: [facelets],
      error: `Solving algorithm error: ${(err as Error).message}`,
    };
  }

  // Parse moves list (e.g. "D2 B' R' B L' B ...")
  const moves = moveString.trim() ? moveString.trim().split(/\s+/) : [];

  // 6. Verify that applying this solution results in a solved cube!
  const verification = verifySolution(facelets, moves);
  if (!verification.verified) {
    return {
      success: false,
      isAlreadySolved: false,
      moves: [],
      stepStates: [facelets],
      error: verification.error || 'Verification failed: calculated moves do not solve this registered state.',
    };
  }

  return {
    success: true,
    isAlreadySolved: moves.length === 0,
    moves,
    stepStates: verification.stepStates,
  };
}
