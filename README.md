# 3×3×3 Rubik's Cube 3D Simulator & Step-by-Step Solver

An interactive, beginner-friendly 3×3 Rubik's Cube registration and step-by-step solving application inspired by the Grubiks classic single-screen layout. Built with **React 19**, **TypeScript**, **Three.js**, and **Vite**, featuring direct 3D tile raycast painting, strict physical parity validation, genuine Kociemba Two-Phase solving ($\le 22$ moves), and physical turn-by-turn 3D animated guidance.

---

## 🌟 Key Features

### 1. Manual Physical Cube Registration (Grubiks-Style UI)
- **Zero-Start Initialization**: All 6 colors (White, Red, Green, Yellow, Orange, Blue) start strictly at `0/9` painted tiles. No color defaults to 48 or 54.
- **Strict 9-Sticker Ceiling**: Prevents entering more than 9 stickers of any color. Attempting to paint a 10th tile is blocked with an instant alert.
- **Direct 3D Raycasting**: Click or tap directly on any sticker of the 3D cube to color it with the active palette color. Differentiates between click-to-paint and drag-to-orbit.
- **Tile Toggle & Edit**: Clicking an already-painted tile with the same active color clears it back to unpainted/blank (reducing count by 1).
- **Smooth 3D Orbiting & View Controls**:
  - `↰ Turn Left`, `↱ Tilt Up`, `↱ Turn Right` buttons for rapid orthogonal rotation.
  - Free 360° touch and mouse drag orbiting with inertia.
  - `Reset` button to return the cube to 0 painted tiles.
  - `Scramble` button to quickly generate a valid random scramble for demonstration.

### 2. Comprehensive Physical Cube Validation (`src/cubeModel.ts`)
Before attempting to solve, the cube state is rigorously checked against standard 3×3 physical invariants:
- **Count Completeness**: Exactly 9 stickers of each of the 6 colors.
- **Center Piece Invariance**: Exactly 6 distinct center pieces defining the physical orientation.
- **Edge Piece Legality**: Exactly 12 valid edges; rejects physically impossible edges (e.g. opposite faces like White-Yellow or Blue-Green).
- **Corner Piece Legality**: Exactly 8 valid corners with proper cyclic chirality.
- **Parity Constraints**:
  - **Corner Twist Parity**: Rejects single corner twists ($\sum \text{twist} \equiv 0 \pmod 3$).
  - **Edge Flip Parity**: Rejects single edge flips ($\sum \text{flip} \equiv 0 \pmod 2$).
  - **Permutation Parity**: Rejects isolated two-piece swaps ($\text{sgn}(\text{corners}) = \text{sgn}(\text{edges})$).

### 3. Genuine Solving Algorithm
- Powered by **Herbert Kociemba's Two-Phase Algorithm**, producing near-optimal solutions (typically 20–22 moves or fewer).
- Native ES module bundle in `src/solver/kociemba.js` (MIT license).
- Instant detection of already-solved cubes (0 moves generated).
- Automated verification: every generated solution is simulated and proven to solve the cube before it is presented to the user.

### 4. Step-by-Step 3D Guided Solver
- **Animated 3D Face Turns**: Smooth 380ms 90° and 180° layer rotations demonstrating each move visually.
- **Fixed Physical Orientation Reference**:
  - `Keep White on TOP and Green in FRONT facing you at all times.`
  - Eliminates the common beginner mistake of rotating the entire cube in hand between turns.
- **Plain-Language Physical Directions**:
  - Large standard WCA notation pill (e.g., **R**, **U'**, **F2**).
  - Explicit turn direction (e.g., *Turn Right face 90° Clockwise*).
  - Tactile beginner cues (e.g., *Turn the right layer upwards/away from you by a single quarter-turn*).
- **Interactive Controls**:
  - `I've Done This Move — Next`: Advances to the next step.
  - `Previous Move`: Reverts to the previous step.
  - `Restart`: Returns to Step 1.
  - `Replay`: Re-runs the 3D move animation for the current step.
- **Progress Tracking**: Real-time progress bar (`Step X of N`, `% Complete`).
- **Celebration Screen**: Appears upon completing all moves, confirming the physical cube is now solved.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Framework** | React 19 (`react`, `react-dom`) |
| **Language** | TypeScript 5.9 (Strict mode) |
| **Build Tool** | Vite 8 + Rollup |
| **3D Graphics** | Three.js (WebGL renderer, Raycasting, OrbitControls) |
| **Solving Engine** | Herbert Kociemba Two-Phase Algorithm (MIT License) |
| **Icons** | Lucide React |
| **Testing** | Node.js + `tsx` (TypeScript Execution) |
| **Linter** | Oxlint |

---

## 🚀 Installation & Local Development

### Prerequisites
- Node.js 18.0 or newer
- npm 9.0 or newer

### 1. Clone or Open the Repository
```bash
git clone <repository-url>
cd yt
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Start Development Server
```bash
npm run dev
```
Open your browser and navigate to:
```
http://127.0.0.1:5173/
```

### 4. Run Automated Test Suite
```bash
npm test
```
Runs all 121 unit and integration tests covering data structures, limits, parities, move simulator, and multi-scramble solver solutions.

### 5. Build for Production
```bash
npm run build
```
Generates optimized static assets in the `dist/` directory.

### 6. Lint Codebase
```bash
npm run lint
```

---

## 📖 How to Use the Application

### Phase 1: Registering Your Physical Cube
1. **Hold your physical cube** with **White on Top** and **Green in Front** facing you.
2. Select a color from the 6 large swatches in the top palette bar (Red, Blue, Yellow, Green, White, Orange).
3. Click or tap directly on the matching tiles of the virtual 3D cube.
4. Use the arrow buttons (`Turn Left`, `Tilt Up`, `Turn Right`) or drag with your mouse/touch to rotate the virtual cube and paint all 6 sides.
5. Watch the swatch counters reach `9/9`. If you make a mistake, click a tile with its current color to clear it, or pick another color to overwrite it.
6. Once all 54 tiles match your real-world cube, click the blue **Solve!** button.

### Phase 2: Validating & Solving
1. The validation modal checks your entered cube state:
   - If invalid: Diagnostic error messages explain the exact issue (e.g., missing colors, impossible edge pieces, or parity errors from a peeled sticker/disassembled cube).
   - If valid: A green confirmation screen appears.
2. Click **Solve My Cube** to launch the step-by-step solver.

### Phase 3: Executing the Solution
1. Keep your physical cube oriented with **White on Top** and **Green in Front** throughout the entire solve.
2. Watch the virtual 3D cube demonstrate the turn animation.
3. Read the plain-language physical turn directions.
4. Perform the exact turn on your physical cube.
5. Click **I've Done This Move — Next**.
6. Repeat for each move until the celebration screen confirms your cube is solved!

---

## 🧮 Solving Algorithm & Licensing

- **Algorithm**: Two-Phase Algorithm discovered by Herbert Kociemba.
- **Characteristics**: Finds a solution of at most 20–22 moves in fractions of a second by reducing the cube to the $G_1 = \langle U, D, R^2, L^2, F^2, B^2 \rangle$ subgroup in Phase 1, then completing the solve in Phase 2.
- **Implementation**: Bundled as a native ES module in `src/solver/kociemba.js`.
- **License**: MIT License (Copyright (c) akheron / ldez).

---

## ⚠️ Important Notes & Known Limitations

1. **Manual User Confirmation**: The application guides you move-by-move and visually demonstrates each turn in 3D. However, it does not possess hardware sensors or cameras to automatically verify whether you turned your physical cube correctly. You must execute each turn accurately and confirm it manually.
2. **No Camera Scanning**: This version focuses strictly on direct 3D manual tile entry. AI computer-vision scanning via webcam is outside the scope of this project.
3. **Standard Western Color Scheme**: The solver assumes the standard Western Rubik's color layout:
   - White opposite Yellow
   - Green opposite Blue
   - Red opposite Orange
   - With White on Top and Green in Front, Red is on the Right and Orange is on the Left.
   If your physical cube has non-standard Japanese or custom color schemes, the physical color mapping may differ.

---

## 📦 How to Create a GitHub Repository & Publish

To publish this project to GitHub, follow these standard steps:

1. **Initialize Git locally** (in the project root):
   ```bash
   git init
   ```

2. **Stage all project files**:
   ```bash
   git add .
   ```

3. **Create the initial commit**:
   ```bash
   git commit -m "feat: complete 3x3 Rubik's Cube 3D simulator and guided solver"
   ```

4. **Create a new repository on GitHub**:
   - Go to [GitHub.com](https://github.com/new).
   - Name your repository (e.g., `rubiks-cube-3d-solver`).
   - Leave it public or private as preferred.
   - Do NOT check "Initialize with a README" (we already have a complete one).

5. **Link and push to GitHub**:
   ```bash
   git remote add origin https://github.com/<your-username>/<your-repo-name>.git
   git branch -M main
   git push -u origin main
   ```

> *Note: Code will not be pushed or published without your explicit instruction.*
