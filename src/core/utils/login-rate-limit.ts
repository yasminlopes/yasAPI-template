/**
 * Rate limit de login: após 3 tentativas inválidas, bloqueia por 15 minutos.
 * Chave = email (ou IP, se preferir).
 */

const BLOCK_DURATION_MS = 15 * 60 * 1000; // 15 min
const MAX_ATTEMPTS = 3;

interface Entry {
  count: number;
  blockedUntil: number;
}

const store = new Map<string, Entry>();

function now() {
  return Date.now();
}

export function isBlocked(key: string): boolean {
  const entry = store.get(key);
  if (!entry) return false;
  if (now() < entry.blockedUntil) return true;
  store.delete(key);
  return false;
}

export function recordFailedAttempt(key: string): void {
  const entry = store.get(key);
  const n = now();

  if (!entry) {
    store.set(key, { count: 1, blockedUntil: 0 });
    return;
  }

  if (entry.blockedUntil > 0 && n < entry.blockedUntil) return; // já bloqueado

  const newCount = entry.blockedUntil > 0 ? 1 : entry.count + 1;
  const blockedUntil = newCount >= MAX_ATTEMPTS ? n + BLOCK_DURATION_MS : 0;
  store.set(key, { count: newCount, blockedUntil });
}

export function clearAttempts(key: string): void {
  store.delete(key);
}

export function getRemainingBlockMs(key: string): number {
  const entry = store.get(key);
  if (!entry || entry.blockedUntil <= 0) return 0;
  const remaining = entry.blockedUntil - now();
  return remaining > 0 ? remaining : 0;
}
