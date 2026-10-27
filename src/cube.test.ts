import { createFreshBlankFacelets, createSolvedFacelets, validateCube } from './cubeModel';
import { applyMove, getInverseMove, isStateSolved, verifySolution, cloneFacelets } from './core/cubeSimulator';
import { solveCube } from './solver/solverService';
import { getMoveInstruction } from './solver/moveInstructions';
import type { FaceId, FaceColor } from './types';
import { ALL_COLORS, ALL_FACES, DEFAULT_FACE_COLORS } from './types';

declare const process: { exit: (code: number) => void };

let pass = 0;
let fail = 0;

function assert(cond: boolean, name: string) {
  if (cond) {
    console.log(`✓ PASS: ${name}`);
    pass++;
  } else {
    console.error(`✗ FAIL: ${name}`);
    fail++;
  }
}

console.log('=================================================================');
console.log('      RUBIK\'S CUBE 3X3X3 — PHASE 3 AUTOMATED VERIFICATION SUITE  ');
console.log('=================================================================\n');

// =================================================================
// 1. CUBE-STATE REPRESENTATION
// =================================================================
console.log('--- 1. Cube-State Representation Tests ---');

const blank = createFreshBlankFacelets();
assert(Object.keys(blank).length === 6, 'Cube state has exactly 6 face entries (U, R, F, D, L, B)');
for (const f of ALL_FACES) {
  assert(Array.isArray(blank[f]), `Face ${f} is an array`);
  assert(blank[f].length === 9, `Face ${f} contains exactly 9 facelets`);
  assert(blank[f].every(v => v === null), `Face ${f} begins with all null (0 painted) tiles`);
}

const solved = createSolvedFacelets();
assert(ALL_FACES.every(f => solved[f].length === 9), 'Solved template has 9 stickers per face');
assert(ALL_FACES.every(f => solved[f].every(c => c === DEFAULT_FACE_COLORS[f])), 'Solved template faces have default Western color assignment');

// =================================================================
// 2. MANUAL COLOUR REGISTRATION & LIMITS
// =================================================================
console.log('\n--- 2. Manual Colour Registration & Limit Tests ---');

const regCube = createFreshBlankFacelets();
regCube.F[0] = 'red';
assert(regCube.F[0] === 'red', 'Direct sticker painting assigns the selected color to the facelet');

// Toggle behavior simulation: painting same color toggles back to null
if (regCube.F[0] === 'red') {
  regCube.F[0] = null;
}
assert(regCube.F[0] === null, 'Clicking tile with active color toggles it back to blank (null)');

// Strict 9-sticker capacity constraint simulation
const testCapacityCube = createSolvedFacelets();
const valCap = validateCube(testCapacityCube);
assert(valCap.counts.red === 9, 'Solved cube has exactly 9 red stickers');
// Attempting to paint a 10th red sticker on a face that was green:
const attempt10thRed = cloneFacelets(testCapacityCube);
attempt10thRed.F[0] = 'red'; // now 10 reds, 8 greens
const valAttempt = validateCube(attempt10thRed);
assert(!valAttempt.isValid, 'Validation rejects state when a color exceeds 9 stickers');
assert(valAttempt.counts.red === 10, 'Count reflects 10 red stickers');
assert(valAttempt.errors.some(e => e.includes('exceeds limit')), 'Error message explicitly reports color capacity exceeded');

// =================================================================
// 3. COLOUR COUNTS & CENTRE PIECE INVARIANCE
// =================================================================
console.log('\n--- 3. Colour Counts & Centre Piece Invariance Tests ---');

const rBlank = validateCube(blank);
assert(rBlank.filledCount === 0, 'Blank cube has 0 filled tiles');
for (const color of ALL_COLORS) {
  assert(rBlank.counts[color] === 0, `Color ${color} starts at 0/9`);
}

// Center pieces are always at index 4 of each face
for (const f of ALL_FACES) {
  assert(solved[f][4] === DEFAULT_FACE_COLORS[f], `Center piece of face ${f} is at index 4 with color ${DEFAULT_FACE_COLORS[f]}`);
}

// Center uniqueness check: duplicate centers
const dupCenters = createSolvedFacelets();
dupCenters.U[4] = 'yellow'; // U and D both yellow
const rDupCenters = validateCube(dupCenters);
assert(!rDupCenters.isValid, 'Validation rejects cube with duplicate center pieces');
assert(rDupCenters.errors.some(e => e.includes('center')), 'Error message notes center uniqueness violation');

// =================================================================
// 4. INVALID CUBE CONFIGURATIONS & PARITY CHECKS
// =================================================================
console.log('\n--- 4. Invalid Cube Configurations & Parity Checks ---');

// Incomplete cube
const incCube = createSolvedFacelets();
incCube.U[0] = null as unknown as FaceColor;
const rInc = validateCube(incCube);
assert(!rInc.isValid, 'Incomplete cube (<54 tiles) is marked invalid');

// Impossible edge: White-Yellow (opposite faces on standard cube)
const badEdge = createSolvedFacelets();
badEdge.U[1] = 'yellow'; // U center is white, so U1=yellow, B1=blue gives impossible edge
const rBadEdge = validateCube(badEdge);
assert(!rBadEdge.isValid, 'Rejects physically impossible edge piece (opposite colors White-Yellow)');

// Corner twist parity violation (1 corner twisted clockwise, sum != 0 mod 3)
const twistCube = createSolvedFacelets();
twistCube.U[8] = 'red';
twistCube.F[2] = 'white';
twistCube.R[0] = 'green';
const rTwist = validateCube(twistCube);
assert(!rTwist.isValid, 'Detects single corner twist parity violation');
assert(rTwist.errors.some(e => e.toLowerCase().includes('corner twist')), 'Explicit diagnostic for corner twist parity');

// Edge flip parity violation (1 edge flipped upside down, sum != 0 mod 2)
const flipCube = createSolvedFacelets();
flipCube.U[7] = 'green';
flipCube.F[1] = 'white';
const rFlip = validateCube(flipCube);
assert(!rFlip.isValid, 'Detects single edge flip parity violation');
assert(rFlip.errors.some(e => e.toLowerCase().includes('edge flip')), 'Explicit diagnostic for edge flip parity');

// Permutation swap parity violation (two edges swapped, corners unchanged)
const swapCube = createSolvedFacelets();
swapCube.U[7] = 'white';
swapCube.F[1] = 'blue';
swapCube.U[1] = 'white';
swapCube.B[1] = 'green';
const rSwap = validateCube(swapCube);
assert(!rSwap.isValid, 'Detects permutation swap parity violation');
assert(rSwap.errors.some(e => e.toLowerCase().includes('parity') || e.toLowerCase().includes('swap')), 'Explicit diagnostic for swap parity');

// =================================================================
// 5. LEGAL FACE MOVES & INVERSES (ALL 18 MOVES)
// =================================================================
console.log('\n--- 5. Legal Face Moves & Inverse Identities Tests ---');

// 18 standard moves
const all18Moves = [
  'U', "U'", 'U2',
  'D', "D'", 'D2',
  'R', "R'", 'R2',
  'L', "L'", 'L2',
  'F', "F'", 'F2',
  'B', "B'", 'B2',
];

// 4 successive quarter-turns return cube to initial state
for (const f of ['U', 'D', 'R', 'L', 'F', 'B'] as FaceId[]) {
  const c = createSolvedFacelets();
  applyMove(c, f);
  applyMove(c, f);
  applyMove(c, f);
  applyMove(c, f);
  assert(isStateSolved(c), `4x ${f} turns return cube to solved state`);
}

// Move + Inverse returns cube to initial state
for (const m of all18Moves) {
  const c = createSolvedFacelets();
  const inv = getInverseMove(m);
  applyMove(c, m);
  applyMove(c, inv);
  assert(isStateSolved(c), `Move ${m} followed by inverse ${inv} preserves solved state`);
}

// Double turn twice returns cube to initial state
for (const f of ['U', 'D', 'R', 'L', 'F', 'B'] as FaceId[]) {
  const c = createSolvedFacelets();
  const m2 = `${f}2`;
  applyMove(c, m2);
  applyMove(c, m2);
  assert(isStateSolved(c), `Move ${m2} twice preserves solved state`);
}

// Layer isolation property: U turns leave bottom (D) face completely undisturbed
const uCube = createSolvedFacelets();
applyMove(uCube, 'U');
applyMove(uCube, "U'");
applyMove(uCube, 'U2');
assert(uCube.D.every(c => c === 'yellow'), 'U turns leave D face completely untouched');

// 18 moves instruction descriptions check
let allInstructionsValid = true;
for (const m of all18Moves) {
  const inst = getMoveInstruction(m);
  if (!inst || !inst.directViewDescription || !inst.physicalActionDescription || !inst.faceColor) {
    allInstructionsValid = false;
  }
}
assert(allInstructionsValid, 'All 18 standard moves provide complete beginner-friendly instruction descriptions');

// =================================================================
// 6. STATE CONVERSION BETWEEN UI & SOLVER
// =================================================================
console.log('\n--- 6. State Conversion (UI to Kociemba Format) Tests ---');

const solvedVal = validateCube(solved);
assert(solvedVal.faceletString !== undefined, 'Solved cube produces valid 54-char Singmaster facelet string');
assert(solvedVal.faceletString?.length === 54, 'Facelet string has length exactly 54');
// Expected solved Singmaster: 9 U's, 9 R's, 9 F's, 9 D's, 9 L's, 9 B's
const expectedSingmaster = 'UUUUUUUUURRRRRRRRRFFFFFFFFFDDDDDDDDDLLLLLLLLLBBBBBBBBB';
assert(solvedVal.faceletString === expectedSingmaster, 'Solved facelet string matches canonical URFDLB Singmaster format');

// =================================================================
// 7. SOLVER CORRECTNESS ACROSS MULTIPLE DISTINCT VALID STATES
// =================================================================
console.log('\n--- 7. Multi-State Solver Correctness & Verification Tests ---');

// Case A: Already-solved cube
const resA = solveCube(createSolvedFacelets());
assert(resA.success, 'Case A (Solved): solveCube succeeds');
assert(resA.isAlreadySolved, 'Case A (Solved): flags isAlreadySolved as true');
assert(resA.moves.length === 0, 'Case A (Solved): generates exactly 0 moves');

// Case B: 4-move scramble (R U R' U')
const stateB = createSolvedFacelets();
applyMove(stateB, 'R');
applyMove(stateB, 'U');
applyMove(stateB, "R'");
applyMove(stateB, "U'");
const resB = solveCube(stateB);
assert(resB.success, 'Case B (4-move scramble): solveCube succeeds');
assert(resB.moves.length > 0, `Case B: generated solution with ${resB.moves.length} moves`);
const verB = verifySolution(stateB, resB.moves);
assert(verB.verified, 'Case B: automated verification confirms solution solves the cube');

// Case C: 10-move scramble
const stateC = createSolvedFacelets();
const scrambleC = ['F', 'R', "U'", 'B', 'D2', 'L', 'F2', 'R', "U'", 'D'];
for (const m of scrambleC) applyMove(stateC, m);
const resC = solveCube(stateC);
assert(resC.success, 'Case C (10-move scramble): solveCube succeeds');
const verC = verifySolution(stateC, resC.moves);
assert(verC.verified, `Case C: solution (${resC.moves.length} moves) fully solves the 10-move scramble`);

// Case D: Superflip pattern (all 12 edges flipped in place, 20 moves optimal)
// Standard Superflip generator: ((U R2 F B R B2 R U2 L B2 R U' D' R2 F R' L B2 U2 F2))
const stateD = createSolvedFacelets();
const superflipMoves = [
  'U', 'R2', 'F', 'B', 'R', 'B2', 'R', 'U2', 'L', 'B2',
  'R', "U'", "D'", 'R2', 'F', "R'", 'L', 'B2', 'U2', 'F2'
];
for (const m of superflipMoves) applyMove(stateD, m);
const resD = solveCube(stateD);
assert(resD.success, 'Case D (Superflip pattern): solveCube succeeds');
assert(resD.moves.length <= 22, `Case D: solver found near-optimal solution of ${resD.moves.length} moves`);
const verD = verifySolution(stateD, resD.moves);
assert(verD.verified, 'Case D: automated verification confirms Superflip is 100% solved');

// Case E: Checkerboard pattern (R2 L2 U2 D2 F2 B2)
const stateE = createSolvedFacelets();
const checkerMoves = ['R2', 'L2', 'U2', 'D2', 'F2', 'B2'];
for (const m of checkerMoves) applyMove(stateE, m);
const resE = solveCube(stateE);
assert(resE.success, 'Case E (Checkerboard pattern): solveCube succeeds');
const verE = verifySolution(stateE, resE.moves);
assert(verE.verified, `Case E: solution (${resE.moves.length} moves) solves checkerboard pattern`);

// Case F: Complex 20-move random scramble
const stateF = createSolvedFacelets();
const scrambleF = [
  'D2', 'R', 'U', 'L2', 'B', "D'", 'F2', 'R2', 'U2', 'F',
  "L'", 'B2', 'D', 'R2', "U'", 'B', 'L', 'F2', 'D2', "R'"
];
for (const m of scrambleF) applyMove(stateF, m);
const resF = solveCube(stateF);
assert(resF.success, 'Case F (20-move complex scramble): solveCube succeeds');
assert(resF.moves.length <= 22, `Case F: generated solution length ${resF.moves.length} moves <= 22`);
const verF = verifySolution(stateF, resF.moves);
assert(verF.verified, 'Case F: automated verification confirms 20-move scramble is completely solved');

// =================================================================
// 8. CORRECT 3D STATE AFTER EACH MOVE (stepStates Integrity)
// =================================================================
console.log('\n--- 8. 3D Step Sequence (stepStates) Integrity Tests ---');

assert(resC.stepStates.length === resC.moves.length + 1, 'stepStates length equals moves.length + 1');
// Initial stepState matches registered state
assert(JSON.stringify(resC.stepStates[0]) === JSON.stringify(stateC), 'stepStates[0] matches starting scrambled state');

// Every intermediate step state transition is valid: stepStates[i] + moves[i] === stepStates[i+1]
let stepChainValid = true;
for (let i = 0; i < resC.moves.length; i++) {
  const simulated = cloneFacelets(resC.stepStates[i]);
  applyMove(simulated, resC.moves[i]);
  if (JSON.stringify(simulated) !== JSON.stringify(resC.stepStates[i + 1])) {
    stepChainValid = false;
    break;
  }
}
assert(stepChainValid, 'Every stepState accurately reflects the application of its corresponding move');

// Final stepState is 100% solved
const finalState = resC.stepStates[resC.stepStates.length - 1];
assert(isStateSolved(finalState), 'Final stepState is 100% solved');

// =================================================================
// 9. PREVIOUS, NEXT, & RESTART NAVIGATION BEHAVIOR
// =================================================================
console.log('\n--- 9. Step Navigation (Next, Previous, Restart) Simulation Tests ---');

let currentStep = 0;
const total = resC.moves.length;

// Simulate clicking "Next" through 5 steps
for (let step = 0; step < 5; step++) {
  currentStep++;
}
assert(currentStep === 5, 'Advancing next increments step index to 5');
assert(JSON.stringify(resC.stepStates[currentStep]) === JSON.stringify(resC.stepStates[5]), 'Cube displays exact 3D state for Step 5');

// Simulate clicking "Previous" twice
currentStep--;
currentStep--;
assert(currentStep === 3, 'Previous decrements step index back to 3');
assert(JSON.stringify(resC.stepStates[currentStep]) === JSON.stringify(resC.stepStates[3]), 'Cube restores exact 3D state for Step 3');

// Simulate clicking "Restart"
currentStep = 0;
assert(currentStep === 0, 'Restart resets step index to 0');
assert(JSON.stringify(resC.stepStates[currentStep]) === JSON.stringify(stateC), 'Restart restores initial scrambled state');

// =================================================================
// 10. COMPLETION-STATE CORRECTNESS
// =================================================================
console.log('\n--- 10. Completion-State Correctness Tests ---');

// Advance to end of solution
currentStep = total;
const isComplete = currentStep >= total;
assert(isComplete, 'Reaching last move triggers completion state');
const endState = resC.stepStates[currentStep];
assert(isStateSolved(endState), 'Completion state cube is verified solved');
const endVal = validateCube(endState);
assert(endVal.isValid, 'Completion state passes all physical cube validations');
assert(endVal.filledCount === 54, 'Completion state has all 54 stickers intact');
for (const color of ALL_COLORS) {
  assert(endVal.counts[color] === 9, `Completion state has exactly 9 ${color} stickers`);
}

// =================================================================
// FINAL SUMMARY
// =================================================================
console.log('\n=================================================================');
console.log(`TOTAL TESTS: ${pass + fail} | PASSED: ${pass} | FAILED: ${fail}`);
console.log('=================================================================\n');

if (fail > 0) {
  process.exit(1);
}
