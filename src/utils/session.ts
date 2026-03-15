/** Read from sessionStorage, returning null if storage is unavailable. */
export function safeSessionGet(key: string): string | null {
  try {
    return sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

/** Write to sessionStorage, silently ignoring failures. */
export function safeSessionSet(key: string, value: string): void {
  try {
    sessionStorage.setItem(key, value);
  } catch {
    // storage unavailable (private mode, quota exceeded, etc.)
  }
}
