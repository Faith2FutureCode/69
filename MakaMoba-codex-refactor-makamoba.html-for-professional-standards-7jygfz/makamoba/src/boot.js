import { DESIGN_TOKEN_DEFAULTS } from './constants.js';
import { preloadAssets } from './assets.js';
import { initializeGame } from './game.js';

function applyDesignTokenDefaults() {
  const root = document.documentElement;
  if (!root) return;
  root.style.setProperty('--map-w', `${DESIGN_TOKEN_DEFAULTS.mapWidth}`);
  root.style.setProperty('--map-h', `${DESIGN_TOKEN_DEFAULTS.mapHeight}`);
  root.style.setProperty('--camera-w', `${DESIGN_TOKEN_DEFAULTS.cameraWidth}`);
  root.style.setProperty('--camera-h', `${DESIGN_TOKEN_DEFAULTS.cameraHeight}`);
  root.style.setProperty('--sidebar-w', `${DESIGN_TOKEN_DEFAULTS.sidebarWidth}px`);
  root.style.setProperty('--sidebar-w-collapsed', `${DESIGN_TOKEN_DEFAULTS.sidebarCollapsedWidth}px`);
  root.style.setProperty('--hud-corner-scale', `${DESIGN_TOKEN_DEFAULTS.hudCornerScale}`);
  root.style.setProperty('--hud-score-scale', `${DESIGN_TOKEN_DEFAULTS.hudScoreScale}`);
  root.style.setProperty('--hud-timer-scale', `${DESIGN_TOKEN_DEFAULTS.hudTimerScale}`);
  root.style.setProperty('--hud-stats-scale', `${DESIGN_TOKEN_DEFAULTS.hudStatsScale}`);
  root.style.setProperty('--menu-width-px', `${DESIGN_TOKEN_DEFAULTS.menuWidth}`);
  root.style.setProperty('--minimap-scale', `${DESIGN_TOKEN_DEFAULTS.minimapScale}`);
  root.style.setProperty('--cursor-hover-color', DESIGN_TOKEN_DEFAULTS.cursorHoverColor);
}

async function start() {
  applyDesignTokenDefaults();
  await preloadAssets();
  initializeGame();
}

function boot() {
  start().catch((err) => {
    console.error('Failed to boot MakaMoba', err);
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot, { once: true });
} else {
  boot();
}
