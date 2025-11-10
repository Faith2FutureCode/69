# MakaMoba Module Refactor Plan

This document captures an actionable breakdown for migrating the current `MakaMoba.html` monolith into a folder-based module architecture. The goal is to keep behavior unchanged while making each layer of the experience independently testable and maintainable.

## Target directory layout

```
makamoba/
├─ index.html
├─ css/
│  └─ makamoba.css
├─ src/
│  ├─ boot.js
│  ├─ game.js
│  ├─ render.js
│  ├─ ui.js
│  ├─ input.js
│  ├─ assets.js
│  └─ constants.js
└─ assets/
   ├─ maps/
   └─ models/
```

The HTML becomes a lightweight shell with an import map and a `<script type="module">` that loads `src/boot.js`. Boot coordinates the rest of the modules.

## Responsibilities by module

### `css/makamoba.css`
Move the existing `<style>` block verbatim into a stylesheet. Future iterations can slice it further (tokens, layout, components), but lifting it out of HTML comes first.

### `src/constants.js`
Centralize design tokens and non-visual numeric constants used across the runtime (camera sizing, minimap defaults, monster tuning knobs, etc.). Export plain objects so game logic and render math read from a single source of truth.

### `src/assets.js`
Collect asset setup:
- Map/image loading utilities (current `<input>` + image wiring)
- 3D loader helpers (FBX/GLTF/DRACO setup)
- Any default asset manifests (model paths, fallback textures)

The module should expose async helpers that resolve when assets are ready so `boot.js` can await them.

### `src/game.js`
Own the authoritative game state:
- Data models for players, monsters, projectiles, score, prayer bindings, etc.
- Core mutation functions (tick/update loops, import/export state, shop operations)
- Factories that currently live in the monolith (`createDefaultMonsterState`, etc.)

Export a constructor (`createGame()` or similar) that returns `{ state, api }`. The API surface is what `ui.js` and `boot.js` call.

### `src/render.js`
House all `draw*` routines and canvas management. The renderer should accept `{ state, canvasContexts, camera }` from `game.js` each frame. Hide canvas resizing, fog-of-war buffers, and minimap drawing behind exported functions such as:
- `initializeRenderer(canvas, fogCanvas, minimapCanvas)`
- `renderFrame(gameState, dt)`

### `src/ui.js`
Wire DOM controls to the game API:
- Sidebar buttons and toggles
- File input import/export
- Scoreboard + HUD updates

Keep pure DOM code here so `game.js` remains unaware of the document. Export `registerUI(gameApi)` that attaches listeners and returns cleanup callbacks.

### `src/input.js`
Isolate pointer + keyboard handling:
- Camera pan/zoom updates
- Click-to-move targeting
- Prayer hotkeys (reading from `constants.js`)

Expose `registerInput(stageEl, camera, gameApi)` similar to UI wiring.

### `src/boot.js`
Serve as the composition root:
1. Import the CSS side-effect.
2. Instantiate the game via `createGame()`.
3. Initialize renderers, UI, and inputs.
4. Start the animation loop (`requestAnimationFrame`).
5. Re-export debugging hooks onto `window` if desired.

## Migration steps

1. **Extract styling.** Move the `<style>` block to `css/makamoba.css` and link it in the new HTML shell.
2. **Scaffold folders.** Create `makamoba/index.html`, `css/`, and `src/` as above. Point the import map to local `src/boot.js`.
3. **Relocate DOM markup.** Copy the existing `<body>` content to `makamoba/index.html`, keeping IDs and structure unchanged.
4. **Carve out constants.** Cut top-level constant definitions into `constants.js` and replace in other modules with imports.
5. **Lift game state + logic.** Move the IIFE contents into `game.js`, swapping implicit globals for explicit exports. Return the functions currently attached to `window` from `createGame()`.
6. **Split rendering.** Transfer every `draw*`, fog-of-war, and minimap function into `render.js`, exporting an initializer + frame renderer that `game.js` calls.
7. **Extract UI.** Move DOM query + event listeners into `ui.js`, letting it call the exported game API. Keep data formatting helpers with the UI unless shared.
8. **Extract input.** Migrate pointer and keyboard listeners into `input.js`, making it a thin adapter that calls `gameApi` methods.
9. **Collect asset utilities.** Relocate loader setup into `assets.js` and import it from `game.js` / `boot.js` as needed.
10. **Wire boot module.** Build `boot.js` to import all modules, orchestrate setup, and kick off the render loop. Ensure the CSS variables previously set inline are now applied during boot.
11. **Smoke test.** Load the new `makamoba/index.html` in a browser to verify parity (sidebar actions, rendering, hotkeys, import/export, etc.).
12. **Remove legacy HTML.** Once validated, delete `MakaMoba.html` or replace it with a redirect to the new shell to prevent drift.

## Notes & follow-ups

- Preserve emoji-driven UI state and legacy IDs so existing CSS selectors continue to work.
- Add ESM exports for testing (`export { exportGameState }`) so unit/integration tests can target specific modules.
- After the split, consider adding linting/formatting and a bundler config if needed for production builds.

