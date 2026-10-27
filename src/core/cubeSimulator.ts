import type { FaceId, FaceColor } from '../types';
import { DEFAULT_FACE_COLORS } from '../types';
import Cube from '../solver/kociemba.js';

const CubeConstructor = Cube;

export type MoveNotation =
  | 'U' | "U'" | 'U2'
  | 'D' | "D'" | 'D2'
  | 'R' | "R'" | 'R2'
  | 'L' | "L'" | 'L2'
  | 'F' | "F'" | 'F2'
  | 'B' | "B'" | 'B2';

/**
 * Deep clones a 54-facelet state record.
 */
export function cloneFacelets<T extends FaceColor | null>(
  state: Record<FaceId, T[]>
): Record<FaceId, T[]> {
  return {
    U: [...state.U],
    R: [...state.R],
    F: [...state.F],
    D: [...state.D],
    L: [...state.L],
    B: [...state.B],
  };
}

/**
 * Converts a 54-facelet record to the canonical 54-character Singmaster string.
 */
export function faceletsToSingmaster(facelets: Record<FaceId, (FaceColor | null)[]>): string {
  const centers: Record<FaceId, FaceColor> = {
    U: facelets.U[4] || 'white',
    R: facelets.R[4] || 'red',
    F: facelets.F[4] || 'green',
    D: facelets.D[4] || 'yellow',
    L: facelets.L[4] || 'orange',
    B: facelets.B[4] || 'blue',
  };

  const colorToFace: Record<FaceColor, FaceId> = {} as Record<FaceColor, FaceId>;
  for (const f of ['U', 'R', 'F', 'D', 'L', 'B'] as FaceId[]) {
    colorToFace[centers[f]] = f;
  }

  let str = '';
  for (const f of ['U', 'R', 'F', 'D', 'L', 'B'] as FaceId[]) {
    for (let i = 0; i < 9; i++) {
      const col = facelets[f][i];
      str += col ? (colorToFace[col] || f) : f;
    }
  }
  return str;
}

/**
 * Converts a 54-character Singmaster string back to a 54-facelet record.
 */
export function singmasterToFacelets(
  str: string,
  centers?: Partial<Record<FaceId, FaceColor>>
): Record<FaceId, FaceColor[]> {
  const faceToColor: Record<FaceId, FaceColor> = {
    U: centers?.U || DEFAULT_FACE_COLORS.U,
    R: centers?.R || DEFAULT_FACE_COLORS.R,
    F: centers?.F || DEFAULT_FACE_COLORS.F,
    D: centers?.D || DEFAULT_FACE_COLORS.D,
    L: centers?.L || DEFAULT_FACE_COLORS.L,
    B: centers?.B || DEFAULT_FACE_COLORS.B,
  };

  const faces: FaceId[] = ['U', 'R', 'F', 'D', 'L', 'B'];
  const res: Record<FaceId, FaceColor[]> = {
    U: [],
    R: [],
    F: [],
    D: [],
    L: [],
    B: [],
  };

  for (let fIdx = 0; fIdx < 6; fIdx++) {
    const face = faces[fIdx];
    for (let i = 0; i < 9; i++) {
      const char = str[fIdx * 9 + i] as FaceId;
      res[face].push(faceToColor[char] || DEFAULT_FACE_COLORS[face]);
    }
  }
  return res;
}

/**
 * Applies a move notation string (e.g. "R", "U'", "F2") to a cube state in place.
 */
export function applyMove(
  cube: Record<FaceId, (FaceColor | null)[]>,
  move: string
): void {
  const trimmed = move.trim();
  if (!trimmed) return;

  const centers: Record<FaceId, FaceColor> = {
    U: cube.U[4] || 'white',
    R: cube.R[4] || 'red',
    F: cube.F[4] || 'green',
    D: cube.D[4] || 'yellow',
    L: cube.L[4] || 'orange',
    B: cube.B[4] || 'blue',
  };

  const currentString = faceletsToSingmaster(cube);
  const cubeInstance = CubeConstructor.fromString(currentString);
  cubeInstance.move(trimmed);
  const updatedString = cubeInstance.asString();
  const nextFacelets = singmasterToFacelets(updatedString, centers);

  for (const f of ['U', 'R', 'F', 'D', 'L', 'B'] as FaceId[]) {
    cube[f] = nextFacelets[f];
  }
}

/**
 * Returns the inverse of any move notation (e.g. R -> R', R' -> R, R2 -> R2).
 */
export function getInverseMove(move: string): string {
  const trimmed = move.trim();
  if (!trimmed) return '';
  const face = trimmed[0];
  const mod = trimmed.length > 1 ? trimmed[1] : '';

  if (mod === "'") return face;
  if (mod === '2') return `${face}2`;
  return `${face}'`;
}

/**
 * Checks whether a given cube state is completely solved (each face has all 9 stickers of identical color).
 */
export function isStateSolved(cube: Record<FaceId, (FaceColor | null)[]>): boolean {
  for (const face of ['U', 'R', 'F', 'D', 'L', 'B'] as FaceId[]) {
    const facelets = cube[face];
    const centerColor = facelets[4];
    if (!centerColor) return false;
    for (let i = 0; i < 9; i++) {
      if (facelets[i] !== centerColor) {
        return false;
      }
    }
  }
  return true;
}

export interface SolutionVerificationResult {
  verified: boolean;
  finalState: Record<FaceId, (FaceColor | null)[]>;
  stepStates: Record<FaceId, (FaceColor | null)[]>[];
  error?: string;
}

/**
 * Verifies that applying the solution move sequence to a clone of initialState results in a solved cube.
 * Also captures all intermediate step states for instant forward/backward navigation.
 */
export function verifySolution(
  initialState: Record<FaceId, (FaceColor | null)[]>,
  moves: string[]
): SolutionVerificationResult {
  const simCube = cloneFacelets(initialState);
  const stepStates: Record<FaceId, (FaceColor | null)[]>[] = [cloneFacelets(simCube)];

  for (let i = 0; i < moves.length; i++) {
    applyMove(simCube, moves[i]);
    stepStates.push(cloneFacelets(simCube));
  }

  const solved = isStateSolved(simCube);

  if (!solved) {
    return {
      verified: false,
      finalState: simCube,
      stepStates,
      error: `Applying the solution sequence (${moves.length} moves) did not result in a solved cube state.`,
    };
  }

  return {
    verified: true,
    finalState: simCube,
    stepStates,
  };
}
