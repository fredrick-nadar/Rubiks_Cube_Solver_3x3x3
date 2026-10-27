import type { FaceId } from '../types';

export interface MoveInstruction {
  notation: string;
  face: FaceId;
  faceName: string;
  faceColor: string;
  angleDescription: string;
  directViewDescription: string;
  physicalActionDescription: string;
  referenceOrientation: string;
}

export const FIXED_REFERENCE_TEXT = 'Keep White on TOP and Green in FRONT facing you at all times.';

export const MOVE_INSTRUCTIONS: Record<string, MoveInstruction> = {
  // RIGHT FACE (Red)
  R: {
    notation: 'R',
    face: 'R',
    faceName: 'Right Face',
    faceColor: 'Red',
    angleDescription: '90° Clockwise',
    directViewDescription: 'Look directly at the RIGHT (Red) face and turn it 90° clockwise (the top edge moves away from you).',
    physicalActionDescription: 'Turn the right layer upwards/away from you by a single quarter-turn.',
    referenceOrientation: FIXED_REFERENCE_TEXT,
  },
  "R'": {
    notation: "R'",
    face: 'R',
    faceName: 'Right Face',
    faceColor: 'Red',
    angleDescription: '90° Counterclockwise (Prime)',
    directViewDescription: 'Look directly at the RIGHT (Red) face and turn it 90° counterclockwise (the top edge moves toward you).',
    physicalActionDescription: 'Pull the right layer downwards/toward you by a single quarter-turn.',
    referenceOrientation: FIXED_REFERENCE_TEXT,
  },
  R2: {
    notation: 'R2',
    face: 'R',
    faceName: 'Right Face',
    faceColor: 'Red',
    angleDescription: '180° Double Turn',
    directViewDescription: 'Turn the RIGHT (Red) face 180° (a half turn, two clicks in either direction).',
    physicalActionDescription: 'Rotate the right layer upside down (180°).',
    referenceOrientation: FIXED_REFERENCE_TEXT,
  },

  // LEFT FACE (Orange)
  L: {
    notation: 'L',
    face: 'L',
    faceName: 'Left Face',
    faceColor: 'Orange',
    angleDescription: '90° Clockwise',
    directViewDescription: 'Look directly at the LEFT (Orange) face and turn it 90° clockwise (the top edge moves toward you).',
    physicalActionDescription: 'Pull the left layer downwards/toward you by a single quarter-turn.',
    referenceOrientation: FIXED_REFERENCE_TEXT,
  },
  "L'": {
    notation: "L'",
    face: 'L',
    faceName: 'Left Face',
    faceColor: 'Orange',
    angleDescription: '90° Counterclockwise (Prime)',
    directViewDescription: 'Look directly at the LEFT (Orange) face and turn it 90° counterclockwise (the top edge moves away from you).',
    physicalActionDescription: 'Push the left layer upwards/away from you by a single quarter-turn.',
    referenceOrientation: FIXED_REFERENCE_TEXT,
  },
  L2: {
    notation: 'L2',
    face: 'L',
    faceName: 'Left Face',
    faceColor: 'Orange',
    angleDescription: '180° Double Turn',
    directViewDescription: 'Turn the LEFT (Orange) face 180° (a half turn, two clicks in either direction).',
    physicalActionDescription: 'Rotate the left layer upside down (180°).',
    referenceOrientation: FIXED_REFERENCE_TEXT,
  },

  // UP FACE (White)
  U: {
    notation: 'U',
    face: 'U',
    faceName: 'Up (Top) Face',
    faceColor: 'White',
    angleDescription: '90° Clockwise',
    directViewDescription: 'Look down at the TOP (White) face and turn it 90° clockwise (the front edge turns to your left).',
    physicalActionDescription: 'Flick or turn the top layer to the left with your right index finger.',
    referenceOrientation: FIXED_REFERENCE_TEXT,
  },
  "U'": {
    notation: "U'",
    face: 'U',
    faceName: 'Up (Top) Face',
    faceColor: 'White',
    angleDescription: '90° Counterclockwise (Prime)',
    directViewDescription: 'Look down at the TOP (White) face and turn it 90° counterclockwise (the front edge turns to your right).',
    physicalActionDescription: 'Flick or turn the top layer to the right with your left index finger.',
    referenceOrientation: FIXED_REFERENCE_TEXT,
  },
  U2: {
    notation: 'U2',
    face: 'U',
    faceName: 'Up (Top) Face',
    faceColor: 'White',
    angleDescription: '180° Double Turn',
    directViewDescription: 'Turn the TOP (White) face 180° (a half turn, two clicks in either direction).',
    physicalActionDescription: 'Rotate the top layer 180° so the front edge moves completely to the back.',
    referenceOrientation: FIXED_REFERENCE_TEXT,
  },

  // DOWN FACE (Yellow)
  D: {
    notation: 'D',
    face: 'D',
    faceName: 'Down (Bottom) Face',
    faceColor: 'Yellow',
    angleDescription: '90° Clockwise',
    directViewDescription: 'Look at the BOTTOM (Yellow) face from underneath and turn it 90° clockwise (from the front, the bottom edge moves to your right).',
    physicalActionDescription: 'Push the bottom layer to the right using your right ring or pinky finger.',
    referenceOrientation: FIXED_REFERENCE_TEXT,
  },
  "D'": {
    notation: "D'",
    face: 'D',
    faceName: 'Down (Bottom) Face',
    faceColor: 'Yellow',
    angleDescription: '90° Counterclockwise (Prime)',
    directViewDescription: 'Look at the BOTTOM (Yellow) face from underneath and turn it 90° counterclockwise (from the front, the bottom edge moves to your left).',
    physicalActionDescription: 'Push the bottom layer to the left using your left ring or pinky finger.',
    referenceOrientation: FIXED_REFERENCE_TEXT,
  },
  D2: {
    notation: 'D2',
    face: 'D',
    faceName: 'Down (Bottom) Face',
    faceColor: 'Yellow',
    angleDescription: '180° Double Turn',
    directViewDescription: 'Turn the BOTTOM (Yellow) face 180° (a half turn, two clicks in either direction).',
    physicalActionDescription: 'Rotate the bottom layer a full half-turn (180°).',
    referenceOrientation: FIXED_REFERENCE_TEXT,
  },

  // FRONT FACE (Green)
  F: {
    notation: 'F',
    face: 'F',
    faceName: 'Front Face',
    faceColor: 'Green',
    angleDescription: '90° Clockwise',
    directViewDescription: 'Look directly at the FRONT (Green) face and turn it 90° clockwise (like turning a steering wheel to the right).',
    physicalActionDescription: 'Turn the front face clockwise 90° so its top edge turns to the right.',
    referenceOrientation: FIXED_REFERENCE_TEXT,
  },
  "F'": {
    notation: "F'",
    face: 'F',
    faceName: 'Front Face',
    faceColor: 'Green',
    angleDescription: '90° Counterclockwise (Prime)',
    directViewDescription: 'Look directly at the FRONT (Green) face and turn it 90° counterclockwise (like turning a steering wheel to the left).',
    physicalActionDescription: 'Turn the front face counterclockwise 90° so its top edge turns to the left.',
    referenceOrientation: FIXED_REFERENCE_TEXT,
  },
  F2: {
    notation: 'F2',
    face: 'F',
    faceName: 'Front Face',
    faceColor: 'Green',
    angleDescription: '180° Double Turn',
    directViewDescription: 'Turn the FRONT (Green) face 180° (a half turn, two clicks in either direction).',
    physicalActionDescription: 'Rotate the front face upside down (180°).',
    referenceOrientation: FIXED_REFERENCE_TEXT,
  },

  // BACK FACE (Blue)
  B: {
    notation: 'B',
    face: 'B',
    faceName: 'Back Face',
    faceColor: 'Blue',
    angleDescription: '90° Clockwise',
    directViewDescription: 'Look directly at the BACK (Blue) face and turn it 90° clockwise (from your normal front viewpoint, the top edge turns to the left).',
    physicalActionDescription: 'Turn the back face clockwise 90° as viewed from behind the cube.',
    referenceOrientation: FIXED_REFERENCE_TEXT,
  },
  "B'": {
    notation: "B'",
    face: 'B',
    faceName: 'Back Face',
    faceColor: 'Blue',
    angleDescription: '90° Counterclockwise (Prime)',
    directViewDescription: 'Look directly at the BACK (Blue) face and turn it 90° counterclockwise (from your normal front viewpoint, the top edge turns to the right).',
    physicalActionDescription: 'Turn the back face counterclockwise 90° as viewed from behind the cube.',
    referenceOrientation: FIXED_REFERENCE_TEXT,
  },
  B2: {
    notation: 'B2',
    face: 'B',
    faceName: 'Back Face',
    faceColor: 'Blue',
    angleDescription: '180° Double Turn',
    directViewDescription: 'Turn the BACK (Blue) face 180° (a half turn, two clicks in either direction).',
    physicalActionDescription: 'Rotate the back face a full half-turn (180°).',
    referenceOrientation: FIXED_REFERENCE_TEXT,
  },
};

/**
 * Retrieves beginner-friendly instruction metadata for any standard move string.
 */
export function getMoveInstruction(move: string): MoveInstruction {
  const clean = move.trim();
  if (MOVE_INSTRUCTIONS[clean]) {
    return MOVE_INSTRUCTIONS[clean];
  }

  // Fallback if unknown modifier
  const face = clean[0] as FaceId;
  return {
    notation: clean,
    face: face || 'U',
    faceName: `${face || 'Up'} Face`,
    faceColor: 'Reference Color',
    angleDescription: 'Turn Layer',
    directViewDescription: `Turn the ${clean} layer as indicated.`,
    physicalActionDescription: `Execute move ${clean} on your physical cube.`,
    referenceOrientation: FIXED_REFERENCE_TEXT,
  };
}
