// src/lib/rateLimit.ts
// Rate limiter sederhana in-memory: batasi percobaan login per NIP + per IP.
// Cukup untuk skala internal (bukan aplikasi publik trafik tinggi).
// Catatan: di Vercel serverless, memory ini reset saat cold start —
// untuk proteksi lebih kuat di production besar, pertimbangkan Redis/Upstash.

interface Attempt {
  count: number
  firstAttempt: number
  blockedUntil?: number
}

const attempts = new Map<string, Attempt>()

const MAX_ATTEMPTS = 3          // maksimal percobaan gagal
const WINDOW_MS = 15 * 60 * 1000 // dalam 15 menit
const BLOCK_MS = 15 * 60 * 1000  // diblokir 15 menit setelah melebihi batas

// Bersihkan entri lama tiap 30 menit supaya memory tidak terus membengkak
setInterval(() => {
  const now = Date.now()
  for (const [key, a] of Array.from(attempts.entries())) {
    if (now - a.firstAttempt > WINDOW_MS && (!a.blockedUntil || now > a.blockedUntil)) {
      attempts.delete(key)
    }
  }
}, 30 * 60 * 1000)

export function checkRateLimit(key: string): { allowed: boolean; retryAfterSeconds?: number } {
  const now = Date.now()
  const a = attempts.get(key)

  if (!a) return { allowed: true }

  if (a.blockedUntil && now < a.blockedUntil) {
    return { allowed: false, retryAfterSeconds: Math.ceil((a.blockedUntil - now) / 1000) }
  }

  // Window sudah lewat, reset hitungan
  if (now - a.firstAttempt > WINDOW_MS) {
    attempts.delete(key)
    return { allowed: true }
  }

  return { allowed: true }
}

export function recordFailedAttempt(key: string) {
  const now = Date.now()
  const a = attempts.get(key)

  if (!a || now - a.firstAttempt > WINDOW_MS) {
    attempts.set(key, { count: 1, firstAttempt: now })
    return
  }

  a.count += 1
  if (a.count >= MAX_ATTEMPTS) {
    a.blockedUntil = now + BLOCK_MS
  }
  attempts.set(key, a)
}

export function clearAttempts(key: string) {
  attempts.delete(key)
}
