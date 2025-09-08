# Claude Game Dev Series: Stonewall (Multi-Phase Prompt)

You are a code generation assistant. We’re going to build a browser-based tower defense game called **Stonewall**, using **HTML, CSS, and JavaScript**, rendered in a `<canvas>` element.

This game is **modular, complex, and will be built in PHASES**, each one focused on a specific mechanic or system.

---

## 📁 Folder Structure (for all phases)
stonewall/
├── index.html
├── style.css
└── game.js

---

## ✅ Game Summary
A strategic tower defense game where the player places towers along a path to stop waves of enemies from reaching the castle. Towers have cost and cooldowns. Enemies follow a waypoint path. The castle has health. Each wave increases in difficulty.

---

## 📦 INSTRUCTIONS FOR EACH PHASE
You will return only the full contents of the three files listed above for each phase. **No explanations, no markdown.** Only raw code content per file.

---

## 🔷 PHASE 1: Canvas Setup & Path Rendering
**Goal:**
- Set up the basic canvas and draw a defined path using waypoints.
- The path should visually curve or zigzag across the screen.
- Add a simple `index.html`, a centered canvas, and placeholder UI for castle health and gold.

---

## 🔷 PHASE 2: Enemy System
**Goal:**
- Implement enemies that follow the path.
- Enemies move smoothly between waypoints.
- Each enemy has health and speed.
- If an enemy reaches the castle, reduce castle health.
- Spawn enemies in waves (hardcoded for now).

---

## 🔷 PHASE 3: Tower Placement
**Goal:**
- Allow the player to place towers with mouse clicks (not on the path).
- Each tower costs gold.
- Prevent placement if not enough gold.
- Show tower range visually on hover.

---

## 🔷 PHASE 4: Tower Targeting and Shooting
**Goal:**
- Towers detect enemies in range and fire bullets.
- Bullets move and deal damage.
- Destroy enemies when health ≤ 0.
- Gain gold per kill.

---

## 🔷 PHASE 5: Game Loop, Waves, and UI
**Goal:**
- Display castle health, gold, current wave.
- Automatically start new waves with increasing difficulty.
- Add basic HUD elements (top bar or sidebar).

---

## 🔷 PHASE 6: Game Over and Restart
**Goal:**
- Show a Game Over overlay when castle health reaches 0.
- Allow player to restart the game.

---

## 🔷 BONUS PHASES (Optional later)
- Tower upgrades
- Multiple tower types
- Enemy variety (speed, tankiness)
- Animated sprites or images
- Sound effects

---

### 📌 Output Format for Each Phase
Return only:
1. `index.html`
2. `style.css`
3. `game.js`

Only return raw file contents. No markdown, no comments, no explanations.

---

Build everything and get it working!