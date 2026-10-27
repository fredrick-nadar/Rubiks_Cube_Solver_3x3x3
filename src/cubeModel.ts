import type { FaceId, FaceColor, ValidationResult } from './types';
import { ALL_COLORS, COLOR_NAMES, DEFAULT_FACE_COLORS } from './types';

// The 12 edge slots: [primaryFace, primaryIndex, secondaryFace, secondaryIndex]
export const EDGE_DEFS = [
  // Top layer (primary: U)
  { name: 'UB', pFace: 'U', pIdx: 1, sFace: 'B', sIdx: 1 },
  { name: 'UL', pFace: 'U', pIdx: 3, sFace: 'L', sIdx: 1 },
  { name: 'UR', pFace: 'U', pIdx: 5, sFace: 'R', sIdx: 1 },
  { name: 'UF', pFace: 'U', pIdx: 7, sFace: 'F', sIdx: 1 },
  // Bottom layer (primary: D)
  { name: 'DF', pFace: 'D', pIdx: 1, sFace: 'F', sIdx: 7 },
  { name: 'DL', pFace: 'D', pIdx: 3, sFace: 'L', sIdx: 7 },
  { name: 'DR', pFace: 'D', pIdx: 5, sFace: 'R', sIdx: 7 },
  { name: 'DB', pFace: 'D', pIdx: 7, sFace: 'B', sIdx: 7 },
  // Middle layer (primary: F or B)
  { name: 'FR', pFace: 'F', pIdx: 5, sFace: 'R', sIdx: 3 },
  { name: 'FL', pFace: 'F', pIdx: 3, sFace: 'L', sIdx: 5 },
  { name: 'BL', pFace: 'B', pIdx: 5, sFace: 'L', sIdx: 3 },
  { name: 'BR', pFace: 'B', pIdx: 3, sFace: 'R', sIdx: 5 },
] as const;

// The 8 corner slots with mathematically verified cyclic face ordering
export const CORNER_DEFS = [
  { name: 'UBL', faces: ['U', 'B', 'L'] as const, indices: [0, 2, 0] as const },
  { name: 'UBR', faces: ['U', 'R', 'B'] as const, indices: [2, 2, 0] as const },
  { name: 'UFR', faces: ['U', 'F', 'R'] as const, indices: [8, 2, 0] as const },
  { name: 'UFL', faces: ['U', 'L', 'F'] as const, indices: [6, 2, 0] as const },
  { name: 'DFL', faces: ['D', 'F', 'L'] as const, indices: [0, 6, 8] as const },
  { name: 'DFR', faces: ['D', 'R', 'F'] as const, indices: [2, 6, 8] as const },
  { name: 'DBR', faces: ['D', 'B', 'R'] as const, indices: [8, 6, 8] as const },
  { name: 'DBL', faces: ['D', 'L', 'B'] as const, indices: [6, 6, 8] as const },
] as const;

// Canonical piece definitions
const CANONICAL_EDGES: { name: string; faces: [FaceId, FaceId] }[] = [
  { name: 'UB', faces: ['U', 'B'] },
  { name: 'UL', faces: ['U', 'L'] },
  { name: 'UR', faces: ['U', 'R'] },
  { name: 'UF', faces: ['U', 'F'] },
  { name: 'DF', faces: ['D', 'F'] },
  { name: 'DL', faces: ['D', 'L'] },
  { name: 'DR', faces: ['D', 'R'] },
  { name: 'DB', faces: ['D', 'B'] },
  { name: 'FR', faces: ['F', 'R'] },
  { name: 'FL', faces: ['F', 'L'] },
  { name: 'BL', faces: ['B', 'L'] },
  { name: 'BR', faces: ['B', 'R'] },
];

const CANONICAL_CORNERS: { name: string; faces: [FaceId, FaceId, FaceId] }[] = [
  { name: 'UBL', faces: ['U', 'B', 'L'] },
  { name: 'UBR', faces: ['U', 'R', 'B'] },
  { name: 'UFR', faces: ['U', 'F', 'R'] },
  { name: 'UFL', faces: ['U', 'L', 'F'] },
  { name: 'DFL', faces: ['D', 'F', 'L'] },
  { name: 'DFR', faces: ['D', 'R', 'F'] },
  { name: 'DBR', faces: ['D', 'B', 'R'] },
  { name: 'DBL', faces: ['D', 'L', 'B'] },
];

function getPermutationParity(perm: number[]): number {
  let inv = 0;
  for (let i = 0; i < perm.length; i++) {
    for (let j = i + 1; j < perm.length; j++) {
      if (perm[i] > perm[j]) inv++;
    }
  }
  return inv % 2;
}

/**
 * Creates completely blank/unpainted cube where all colors start at 0.
 */
export function createFreshBlankFacelets(): Record<FaceId, (FaceColor | null)[]> {
  return {
    U: Array(9).fill(null),
    R: Array(9).fill(null),
    F: Array(9).fill(null),
    D: Array(9).fill(null),
    L: Array(9).fill(null),
    B: Array(9).fill(null),
  };
}

/**
 * Creates default solved 54-facelet map (all 9 of each color).
 */
export function createSolvedFacelets(): Record<FaceId, FaceColor[]> {
  return {
    U: Array(9).fill('white') as FaceColor[],
    R: Array(9).fill('red') as FaceColor[],
    F: Array(9).fill('green') as FaceColor[],
    D: Array(9).fill('yellow') as FaceColor[],
    L: Array(9).fill('orange') as FaceColor[],
    B: Array(9).fill('blue') as FaceColor[],
  };
}

/**
 * Validates the cube state with plain-language, beginner-friendly diagnostic messages.
 */
export function validateCube(facelets: Record<FaceId, (FaceColor | null)[]>): ValidationResult {
  const errors: string[] = [];

  // 1. Count validation
  const counts: Record<FaceColor, number> = {
    red: 0,
    blue: 0,
    yellow: 0,
    green: 0,
    white: 0,
    orange: 0,
  };

  let filledCount = 0;

  for (const face of ['U', 'R', 'F', 'D', 'L', 'B'] as FaceId[]) {
    for (const color of facelets[face]) {
      if (color) {
        counts[color]++;
        filledCount++;
      }
    }
  }

  // Completeness check
  if (filledCount < 54) {
    errors.push(`Registration incomplete: ${filledCount} of 54 tiles colored (${54 - filledCount} remaining).`);
  }

  // Count check
  const incompleteColors: string[] = [];
  for (const color of ALL_COLORS) {
    if (counts[color] < 9) {
      incompleteColors.push(`${COLOR_NAMES[color]} has ${counts[color]}/9`);
    } else if (counts[color] > 9) {
      errors.push(`${COLOR_NAMES[color]} exceeds limit (${counts[color]}/9). Maximum is 9.`);
    }
  }

  if (filledCount < 54 && incompleteColors.length > 0) {
    errors.push(`Missing stickers: ${incompleteColors.join(', ')}.`);
  }

  // 2. Center stickers check
  const centers: Partial<Record<FaceId, FaceColor>> = {};
  const usedCenters = new Set<FaceColor>();

  for (const face of ['U', 'R', 'F', 'D', 'L', 'B'] as FaceId[]) {
    const centerColor = facelets[face][4];
    if (centerColor) {
      centers[face] = centerColor;
      usedCenters.add(centerColor);
    }
  }

  if (usedCenters.size < 6) {
    errors.push(`The 6 center tiles must each have a different color. Found ${usedCenters.size} distinct center colors.`);
  }

  // If incomplete or counts wrong, return early
  if (filledCount < 54 || errors.length > 0) {
    return {
      isValid: false,
      isComplete: filledCount === 54,
      filledCount,
      errors,
      counts,
    };
  }

  // Map each color to FaceId from the centers
  const colorToFaceId: Record<FaceColor, FaceId> = {} as Record<FaceColor, FaceId>;
  for (const face of ['U', 'R', 'F', 'D', 'L', 'B'] as FaceId[]) {
    colorToFaceId[centers[face]!] = face;
  }

  // Construct 54-char Singmaster string
  let faceletString = '';
  for (const face of ['U', 'R', 'F', 'D', 'L', 'B'] as FaceId[]) {
    for (let i = 0; i < 9; i++) {
      const col = facelets[face][i]!;
      faceletString += colorToFaceId[col] || DEFAULT_FACE_COLORS[face];
    }
  }

  // 3. Edge validation
  let edgeFlipSum = 0;
  const edgePerm: number[] = [];
  const foundEdges = new Set<string>();

  for (const e of EDGE_DEFS) {
    const colP = facelets[e.pFace][e.pIdx]!;
    const colS = facelets[e.sFace][e.sIdx]!;

    const faceP = colorToFaceId[colP];
    const faceS = colorToFaceId[colS];

    const matchIdx = CANONICAL_EDGES.findIndex(
      ce => (ce.faces[0] === faceP && ce.faces[1] === faceS) || (ce.faces[0] === faceS && ce.faces[1] === faceP)
    );

    if (matchIdx === -1) {
      errors.push(`Impossible edge piece: ${COLOR_NAMES[colP]} and ${COLOR_NAMES[colS]} cannot be on the same edge piece.`);
      continue;
    }

    const matched = CANONICAL_EDGES[matchIdx];
    if (foundEdges.has(matched.name)) {
      errors.push(`Duplicate edge piece: multiple ${matched.name} edge pieces found on the cube.`);
    }
    foundEdges.add(matched.name);
    edgePerm.push(matchIdx);

    // Edge flip
    const isUD = (f: FaceId) => f === 'U' || f === 'D';
    let flip = 0;
    if (isUD(faceP) || isUD(faceS)) {
      flip = isUD(faceP) ? 0 : 1;
    } else {
      const isFB = (f: FaceId) => f === 'F' || f === 'B';
      flip = isFB(faceP) ? 0 : 1;
    }
    edgeFlipSum += flip;
  }

  // 4. Corner validation
  let cornerTwistSum = 0;
  const cornerPerm: number[] = [];
  const foundCorners = new Set<string>();

  for (const c of CORNER_DEFS) {
    const col0 = facelets[c.faces[0]][c.indices[0]]!;
    const col1 = facelets[c.faces[1]][c.indices[1]]!;
    const col2 = facelets[c.faces[2]][c.indices[2]]!;

    const face0 = colorToFaceId[col0];
    const face1 = colorToFaceId[col1];
    const face2 = colorToFaceId[col2];

    const current = [face0, face1, face2];
    const matchIdx = CANONICAL_CORNERS.findIndex(
      cc => current.includes(cc.faces[0]) && current.includes(cc.faces[1]) && current.includes(cc.faces[2])
    );

    if (matchIdx === -1) {
      errors.push(`Impossible corner piece: ${COLOR_NAMES[col0]}, ${COLOR_NAMES[col1]}, and ${COLOR_NAMES[col2]} cannot form a valid corner.`);
      continue;
    }

    const matched = CANONICAL_CORNERS[matchIdx];
    if (foundCorners.has(matched.name)) {
      errors.push(`Duplicate corner piece: multiple ${matched.name} corner pieces found.`);
    }
    foundCorners.add(matched.name);
    cornerPerm.push(matchIdx);

    // Corner twist
    let twist = 0;
    if (face0 === 'U' || face0 === 'D') {
      twist = 0;
    } else if (face1 === 'U' || face1 === 'D') {
      twist = 1;
    } else if (face2 === 'U' || face2 === 'D') {
      twist = 2;
    }
    cornerTwistSum += twist;
  }

  // 5. Parity checks
  if (foundEdges.size === 12 && foundCorners.size === 8) {
    if (cornerTwistSum % 3 !== 0) {
      errors.push('Corner twist error: One corner is twisted in place. This cannot occur without disassembling the cube.');
    }
    if (edgeFlipSum % 2 !== 0) {
      errors.push('Edge flip error: Exactly one edge is flipped upside down. Please check your physical cube.');
    }
    const cp = getPermutationParity(cornerPerm);
    const ep = getPermutationParity(edgePerm);
    if (cp !== ep) {
      errors.push('Swap parity error: Two pieces appear swapped. Please re-check the colors of your cube.');
    }
  }

  const isValid = errors.length === 0;

  return {
    isValid,
    isComplete: true,
    filledCount: 54,
    errors,
    counts,
    faceletString: isValid ? faceletString : undefined,
  };
}
