export const GAME_WIDTH = 1280;
export const GAME_HEIGHT = 720;
export const MAX_PARTY_SIZE = 2;
export const MAX_OFFLINE_SECONDS = 8 * 60 * 60;
export const OFFLINE_RATES = Object.freeze({ gold: 45, diamond: 12, exp: 35 });
export const SAVE_KEY = 'PixelIdleRPG.save.v1';
export const SAVE_VERSION = 1;
export const INITIAL_PLAYER = Object.freeze({
  name: 'PixelHero',
  level: 1,
  exp: 0,
  power: 12458,
  gold: 30000,
  diamond: 500,
  vip: 1
});
export const RARITIES = Object.freeze([
  { id: 'common', name: 'Common', label: '灰色', color: '#bfc3cc', stars: 1, next: 'uncommon', cost: 1000, multiplier: 1 },
  { id: 'uncommon', name: 'Uncommon', label: '綠色', color: '#72d84e', stars: 2, next: 'rare', cost: 5000, multiplier: 1.45 },
  { id: 'rare', name: 'Rare', label: '藍色', color: '#4da3ff', stars: 3, next: 'epic', cost: 10000, multiplier: 2.15 },
  { id: 'epic', name: 'Epic', label: '紫色', color: '#bd70ff', stars: 4, next: 'legendary', cost: 50000, multiplier: 3.25 },
  { id: 'legendary', name: 'Legendary', label: '橙色', color: '#ffad43', stars: 5, next: 'mythic', cost: 200000, multiplier: 4.9 },
  { id: 'mythic', name: 'Mythic', label: '紅色', color: '#ff4f62', stars: 6, next: null, cost: null, multiplier: 7.2 }
]);
export const EQUIPMENT_SLOTS = Object.freeze(['weapon','helmet','armor','boots','ring','necklace','gloves','belt','accessory']);
export const UI_BREAKPOINT = 920;
export const EVENT_NAMES = Object.freeze({
  SAVE_CHANGED: 'save-changed',
  SCENE_CHANGED: 'scene-changed',
  BATTLE_SNAPSHOT: 'battle-snapshot',
  NAVIGATE: 'navigate',
  TOAST: 'toast',
  MODAL: 'modal',
  SYNTHESIS_CHANGED: 'synthesis-changed',
  SELECT_HERO: 'select-hero',
  USE_SKILL: 'use-skill',
  TOGGLE_AUTO: 'toggle-auto',
  START_STAGE: 'start-stage'
});
