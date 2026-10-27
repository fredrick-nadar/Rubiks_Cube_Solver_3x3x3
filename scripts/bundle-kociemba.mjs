import fs from 'node:fs';

let cubeCode = fs.readFileSync('node_modules/cubejs/lib/cube.js', 'utf8');
let solveCode = fs.readFileSync('node_modules/cubejs/lib/solve.js', 'utf8');

// Strip outer (function() { and }).call(this); from cubeCode
cubeCode = cubeCode.trim();
if (cubeCode.startsWith('(function() {')) {
  cubeCode = cubeCode.slice('(function() {'.length);
}
const cubeEndIdx = cubeCode.lastIndexOf('}).call(this);');
if (cubeEndIdx !== -1) {
  cubeCode = cubeCode.slice(0, cubeEndIdx);
}
// Remove the globals block at the end of cubeCode
const globalsIdx = cubeCode.indexOf('//# Globals');
if (globalsIdx !== -1) {
  cubeCode = cubeCode.slice(0, globalsIdx);
}

// Strip outer (function() { and }).call(this); from solveCode
solveCode = solveCode.trim();
if (solveCode.startsWith('(function() {')) {
  solveCode = solveCode.slice('(function() {'.length);
}
const solveEndIdx = solveCode.lastIndexOf('}).call(this);');
if (solveEndIdx !== -1) {
  solveCode = solveCode.slice(0, solveEndIdx);
}
// Replace require('./cube') with Cube
solveCode = solveCode.replace("Cube = this.Cube || require('./cube');", '// Cube defined above');

const output = `// MIT License - akheron / ldez - cubejs
/* eslint-disable */
// @ts-nocheck

var globalScope = typeof globalThis !== 'undefined' ? globalThis : (typeof window !== 'undefined' ? window : {});

${cubeCode}

${solveCode}

export default Cube;
export { Cube };
`;

fs.writeFileSync('src/solver/kociemba.js', output, 'utf8');
console.log('Successfully bundled clean ESM kociemba.js, length:', output.length);
