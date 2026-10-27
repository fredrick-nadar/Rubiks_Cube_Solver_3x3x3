export type FaceId = 'U' | 'R' | 'F' | 'D' | 'L' | 'B';

export type FaceColor = 'red' | 'blue' | 'yellow' | 'green' | 'white' | 'orange';

export const ALL_COLORS: FaceColor[] = ['red', 'blue', 'yellow', 'green', 'white', 'orange'];
export const ALL_FACES: FaceId[] = ['U', 'R', 'F', 'D', 'L', 'B'];

export const BLANK_HEX = '#D8DCE3'; // Neutral unpainted tile tone

export const COLOR_HEX: Record<FaceColor, string> = {
  red: '#C7242F',
  blue: '#3579DE',
  yellow: '#FFDD00',
  green: '#2ABB2A',
  white: '#FFFFFF',
  orange: '#FF6D00',
};

export const COLOR_NAMES: Record<FaceColor, string> = {
  red: 'Red',
  blue: 'Blue',
  yellow: 'Yellow',
  green: 'Green',
  white: 'White',
  orange: 'Orange',
};

export const DEFAULT_FACE_COLORS: Record<FaceId, FaceColor> = {
  U: 'white',
  R: 'red',
  F: 'green',
  D: 'yellow',
  L: 'orange',
  B: 'blue',
};

export interface ValidationResult {
  isValid: boolean;
  isComplete: boolean;
  filledCount: number;
  errors: string[];
  counts: Record<FaceColor, number>;
  faceletString?: string;
}
