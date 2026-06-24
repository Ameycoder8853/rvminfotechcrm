// In-memory sliding window rate limiter

interface RateLimitTracker {
  timestamps: number[];
  lastAccess: number;
}

const rateLimitMap = new Map<string, RateLimitTracker>();

// Periodic cleanup threshold
let lastCleanupTime = Date.now();
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000; // Cleanup every 5 minutes
const MAX_MAP_SIZE = 10000; // Protect against memory bloat

function performCleanup(now: number, windowMs: number) {
  for (const [key, tracker] of rateLimitMap.entries()) {
    // Remove expired timestamps
    tracker.timestamps = tracker.timestamps.filter(time => now - time < windowMs);
    
    // If no timestamps left or tracker inactive for over a minute, delete the entry
    if (tracker.timestamps.length === 0 || now - tracker.lastAccess > windowMs) {
      rateLimitMap.delete(key);
    }
  }
  lastCleanupTime = now;
}

/**
 * Checks if a specific key (IP address or User ID) has exceeded the rate limit.
 * 
 * @param key The key to rate limit (e.g. IP or User ID)
 * @param limit Max number of allowed requests in the window
 * @param windowMs Time window in milliseconds
 * @returns boolean true if rate limited, false otherwise
 */
export function isRateLimited(key: string, limit = 60, windowMs = 60000): boolean {
  const now = Date.now();

  // Run cleanup occasionally
  if (now - lastCleanupTime > CLEANUP_INTERVAL_MS || rateLimitMap.size > MAX_MAP_SIZE) {
    performCleanup(now, windowMs);
  }

  if (!rateLimitMap.has(key)) {
    rateLimitMap.set(key, {
      timestamps: [now],
      lastAccess: now
    });
    return false;
  }

  const tracker = rateLimitMap.get(key)!;
  tracker.lastAccess = now;

  // Filter out timestamps outside the sliding window
  tracker.timestamps = tracker.timestamps.filter(time => now - time < windowMs);

  if (tracker.timestamps.length >= limit) {
    return true;
  }

  tracker.timestamps.push(now);
  return false;
}
