**Claude Prompt: Starship Blaster – Multi-File Version (More Advanced)**

You are a coding assistant. Build a browser-based space shooter game called **Starship Blaster**. The game should be split into multiple files and structured like a small game project. The game should be clean, fun, and beginner-friendly.

---

## 📁 Folder Structure
Create the following:

```
starship-blaster/
├── index.html
├── style.css
└── game.js
```

---

## ✅ Features

### Player (Ship)
- White rectangle or simple emoji 🚀.
- Starts at bottom center of canvas.
- Moves left/right using **ArrowLeft** and **ArrowRight**.

### Bullets
- Fired using **Spacebar**.
- Red rectangles or 🔺 emoji.
- Fire one bullet per keypress (no holding).
- Removed when offscreen.

### Enemies
- Appear from the top, move downward.
- Random spawn positions.
- Hit by bullets = removed.
- If one touches the bottom = **Game Over**.

### Game Loop
- Use `requestAnimationFrame()`.
- Loop updates and renders:
    - Player
    - Bullets
    - Enemies
    - Collision detection

### Score
- Display score in top-left corner.
- +1 point per enemy destroyed.
- Reset score on Game Over.

### Game Over
- Show a **Game Over** overlay message.
- Include a **Restart** button or allow pressing Enter to restart.

---

## 🎨 Style (style.css)
- Black background canvas.
- White ship.
- Red bullets.
- Green or orange enemies.
- Center canvas on page.
- Overlay game over screen with semi-transparent background.

---

## ⚙️ index.html
- HTML boilerplate.
- Link to `style.css` and `game.js`.
- Contains a `<canvas id="gameCanvas">` and game UI (score, overlay).

---

## 📦 Output Instructions
Return:
1. Full contents of `index.html`
2. Full contents of `style.css`
3. Full contents of `game.js`

Do not return explanations, markdown, or notes. Just the raw contents of each file, clearly separated.
