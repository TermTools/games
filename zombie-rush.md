**Claude Prompt: Zombie Rush – Multi-File Canvas Game (Advanced Beginner)**

You are a code generation assistant. Generate a multi-file browser game called **Zombie Rush** using **HTML, CSS, and JavaScript**, rendered on a `<canvas>`. The player moves in all directions and shoots zombies to survive. Files should be separated cleanly.

---

## 📁 Folder Structure
Create:
```
zombie-rush/
├── index.html
├── style.css
└── game.js
```

---

## ✅ Game Features

### Player
- Controlled by **WASD** keys and arrow keys.
- Can move in 4 directions.
- Rotates to face the mouse cursor.
- Fires bullets toward the mouse with **left click**.
- Has health (100). If hit by zombie, loses health.

### Bullets
- Fire in the direction of the mouse.
- Travel in straight line.
- Disappear on impact or when off-screen.

### Zombies (Enemies)
- Spawn from edges of screen.
- Slowly move toward player.
- On collision with player, deal damage and disappear.
- New zombies spawn every few seconds. Increase difficulty over time.

### Game Loop
- Use `requestAnimationFrame()`.
- Each frame: update game logic, detect collisions, draw everything.

### UI
- Top-left: **Health** bar.
- Top-right: **Score** (number of zombies killed).
- When health reaches 0, show **Game Over** overlay and restart button.

---

## 🖼️ Style (style.css)
- Centered black canvas.
- Red zombies, blue player, yellow bullets.
- White text for UI.
- Overlay screen for game over.

---

## ⚙️ index.html
- Basic HTML5 boilerplate.
- Link to `style.css` and `game.js`.
- Includes:
  - `<canvas id="gameCanvas">`
  - `<div id="ui">` for score and health
  - `<div id="overlay">` for game over screen

---

## 📦 Output Format
Return **only the full contents** of the following files, clearly separated:
1. `index.html`
2. `style.css`
3. `game.js`

Do **not** return markdown, comments, or explanations — just the raw file contents, ready to copy and paste.

---

This is a more advanced game than Starship Blaster. Make it smooth, fun, clean, and beginner-accessible — with files properly modularized and well-structured.

