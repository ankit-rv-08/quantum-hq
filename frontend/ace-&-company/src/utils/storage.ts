import { FloorId, AppTab, ThemeMode, TimeOfDay } from '../types';

export const STORAGE_KEYS = {
  ACTIVE_TAB: 'quantum_hq_active_tab',
  SELECTED_FLOOR: 'quantum_hq_selected_floor',
  BLUEPRINT_MODE: 'quantum_hq_blueprint_mode',
  THEME_MODE: 'quantum_hq_theme_mode',
  TIME_OF_DAY: 'quantum_hq_time_of_day',
} as const;

const VALID_TABS: AppTab[] = ['command', 'boardroom', 'archive', 'performance', 'terminal'];
const VALID_FLOORS: FloorId[] = [0, 1, 2, 3, 4];
const VALID_THEMES: ThemeMode[] = ['light', 'dark'];
const VALID_TIMES: TimeOfDay[] = ['day', 'sunset', 'night'];

// In-memory fallback if localStorage and sessionStorage are restricted or throw SecurityError
const memoryStore = new Map<string, string>();

function safeGetItem(key: string): string | null {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const val = window.localStorage.getItem(key);
      if (val !== null) return val;
    }
  } catch {
    // Fall back to sessionStorage
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        const sessionVal = window.sessionStorage.getItem(key);
        if (sessionVal !== null) return sessionVal;
      }
    } catch {
      // Ignore
    }
  }
  return memoryStore.get(key) ?? null;
}

function safeSetItem(key: string, value: string): void {
  memoryStore.set(key, value);
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(key, value);
      return;
    }
  } catch {
    // Attempt sessionStorage fallback
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        window.sessionStorage.setItem(key, value);
        return;
      }
    } catch {
      // Memory fallback active
    }
  }
}

/**
 * Reads the active tab from storage with strict validation.
 */
export function getPersistedTab(defaultTab: AppTab = 'command'): AppTab {
  const raw = safeGetItem(STORAGE_KEYS.ACTIVE_TAB);
  if (raw && VALID_TABS.includes(raw as AppTab)) {
    return raw as AppTab;
  }
  return defaultTab;
}

/**
 * Persists the active dashboard tab.
 */
export function setPersistedTab(tab: AppTab): void {
  if (VALID_TABS.includes(tab)) {
    safeSetItem(STORAGE_KEYS.ACTIVE_TAB, tab);
  }
}

/**
 * Reads the selected floor ID from storage with validation.
 */
export function getPersistedFloor(defaultFloor: FloorId | null = 4): FloorId | null {
  const raw = safeGetItem(STORAGE_KEYS.SELECTED_FLOOR);
  if (raw === null || raw === 'null') {
    return defaultFloor;
  }
  const parsed = Number(raw);
  if (!Number.isNaN(parsed) && VALID_FLOORS.includes(parsed as FloorId)) {
    return parsed as FloorId;
  }
  return defaultFloor;
}

/**
 * Persists the active floor selection.
 */
export function setPersistedFloor(floorId: FloorId | null): void {
  if (floorId === null) {
    safeSetItem(STORAGE_KEYS.SELECTED_FLOOR, 'null');
  } else if (VALID_FLOORS.includes(floorId)) {
    safeSetItem(STORAGE_KEYS.SELECTED_FLOOR, floorId.toString());
  }
}

/**
 * Reads the blueprint mode boolean state from storage.
 */
export function getPersistedBlueprintMode(defaultMode = false): boolean {
  const raw = safeGetItem(STORAGE_KEYS.BLUEPRINT_MODE);
  if (raw === 'true') return true;
  if (raw === 'false') return false;
  return defaultMode;
}

/**
 * Persists the blueprint mode state.
 */
export function setPersistedBlueprintMode(enabled: boolean): void {
  safeSetItem(STORAGE_KEYS.BLUEPRINT_MODE, enabled ? 'true' : 'false');
}

/**
 * Reads the theme mode (light vs dark) from storage.
 */
export function getPersistedThemeMode(defaultMode: ThemeMode = 'dark'): ThemeMode {
  const raw = safeGetItem(STORAGE_KEYS.THEME_MODE);
  if (raw && VALID_THEMES.includes(raw as ThemeMode)) {
    return raw as ThemeMode;
  }
  return defaultMode;
}

/**
 * Persists the theme mode.
 */
export function setPersistedThemeMode(mode: ThemeMode): void {
  if (VALID_THEMES.includes(mode)) {
    safeSetItem(STORAGE_KEYS.THEME_MODE, mode);
  }
}

/**
 * Reads the exterior environment time of day (day, sunset, night) from storage.
 */
export function getPersistedTimeOfDay(defaultTime: TimeOfDay = 'sunset'): TimeOfDay {
  const raw = safeGetItem(STORAGE_KEYS.TIME_OF_DAY);
  if (raw && VALID_TIMES.includes(raw as TimeOfDay)) {
    return raw as TimeOfDay;
  }
  return defaultTime;
}

/**
 * Persists the time of day.
 */
export function setPersistedTimeOfDay(time: TimeOfDay): void {
  if (VALID_TIMES.includes(time)) {
    safeSetItem(STORAGE_KEYS.TIME_OF_DAY, time);
  }
}
