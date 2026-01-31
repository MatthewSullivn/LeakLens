/**
 * In-memory and sessionStorage cache for wallet analysis results.
 * Speeds up repeat views and prefetched demo wallet.
 */

import type { AnalysisResult } from '@/components/analysis/types'

const CACHE_PREFIX = 'leaklens_analysis_'
const CACHE_KEYS_KEY = 'leaklens_cache_keys'
const MAX_SESSION_ENTRIES = 5

const memory = new Map<string, AnalysisResult>()

function normalizeWallet(wallet: string): string {
  return wallet.trim()
}

function getSessionKeys(): string[] {
  if (typeof sessionStorage === 'undefined') return []
  try {
    const raw = sessionStorage.getItem(CACHE_KEYS_KEY)
    return raw ? (JSON.parse(raw) as string[]) : []
  } catch {
    return []
  }
}

function setSessionKeys(keys: string[]): void {
  if (typeof sessionStorage === 'undefined') return
  try {
    sessionStorage.setItem(CACHE_KEYS_KEY, JSON.stringify(keys.slice(-MAX_SESSION_ENTRIES)))
  } catch {
    /* ignore */
  }
}

/**
 * Get cached analysis for a wallet, if any.
 * Checks in-memory first, then sessionStorage (and rehydrates memory).
 */
export function getCachedAnalysis(wallet: string): AnalysisResult | null {
  const key = normalizeWallet(wallet)
  const fromMemory = memory.get(key)
  if (fromMemory) return fromMemory
  if (typeof sessionStorage === 'undefined') return null
  try {
    const raw = sessionStorage.getItem(CACHE_PREFIX + key)
    if (!raw) return null
    const data = JSON.parse(raw) as AnalysisResult
    memory.set(key, data)
    return data
  } catch {
    return null
  }
}

/**
 * Store analysis result for a wallet (memory + sessionStorage, capped).
 */
export function setCachedAnalysis(wallet: string, data: AnalysisResult): void {
  const key = normalizeWallet(wallet)
  memory.set(key, data)
  if (typeof sessionStorage === 'undefined') return
  try {
    const keys = getSessionKeys()
    const without = keys.filter((k) => k !== key)
    without.push(key)
    const toKeep = without.slice(-MAX_SESSION_ENTRIES)
    const toEvict = without.length > MAX_SESSION_ENTRIES ? without.slice(0, -MAX_SESSION_ENTRIES) : []
    for (const k of toEvict) {
      sessionStorage.removeItem(CACHE_PREFIX + k)
    }
    setSessionKeys(toKeep)
    sessionStorage.setItem(CACHE_PREFIX + key, JSON.stringify(data))
  } catch {
    /* ignore */
  }
}

/**
 * Prefetch analysis for a wallet and store in cache.
 * Call on hover or page load (e.g. demo wallet link). No-op if already cached.
 */
export function prefetchAnalysis(wallet: string, limit = 50): void {
  const key = normalizeWallet(wallet)
  if (memory.has(key)) return
  fetch('/api/analyze-wallet', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ wallet: key, limit }),
  })
    .then((res) => {
      if (!res.ok) return
      return res.json() as Promise<AnalysisResult>
    })
    .then((data) => {
      if (data) setCachedAnalysis(key, data)
    })
    .catch(() => {
      /* ignore prefetch errors */
    })
}
