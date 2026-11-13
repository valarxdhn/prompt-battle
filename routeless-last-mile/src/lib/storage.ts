import type { AppState } from '../types';

export const STORAGE_KEY = 'routeless-state';

/**
 * Persist the entire app state to localStorage.
 * Silently swallows errors (e.g. private browsing quota exceeded).
 */
export function saveToStorage(state: unknown): void {
  try {
    const serialised = JSON.stringify(state);
    localStorage.setItem(STORAGE_KEY, serialised);
  } catch {
    // Quota exceeded or serialisation error — fail silently.
  }
}

/**
 * Load previously persisted state from localStorage.
 * Returns null if nothing is stored or the data is corrupt.
 */
export function loadFromStorage(): Partial<AppState> | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Partial<AppState>;
  } catch {
    return null;
  }
}
