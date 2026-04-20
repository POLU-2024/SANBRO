# SANBRO Chess

A React + TypeScript implementation of **SANBRO Chess** with a galactic-blue UI, authentication, and playable chess arena.

## Features included
- Home page with chess history/rules and **PLAY CHESS** CTA.
- Name-only sign in/sign up with localStorage.
- Light-blue / dark-blue chessboard and highlighted states:
  - Last move (transparent light yellow)
  - Check (transparent red)
  - Valid move squares (transparent light yellow)
- Drag-and-drop and click-to-move.
- Move history with full analysis-symbol vocabulary.
- Opening/trap detector banner (starter opening map).
- Evaluation bar with numeric White/Black percentages.
- Undo/Redo with snapshot history.
- Switch sides, resign, new game, and hint controls.
- Suggestion/attack arrows (green/red).
- Timer presets including unlimited and live countdown.
- White/Black/Random side selection.
- 2-player and AI opponent mode.
- Bot catalog from 50-4000 ELO including **Polu** and **Neel**.
- Bot chat + coach-like hint panel.
- Checkmate and draw state indicators.

## Run locally
```bash
npm install
npm run dev
```
