// Mock Redis for Brute-force protection
// In a real environment, this uses an actual Redis client (e.g. ioredis)

class MockRedis {
  private store: Map<string, { count: number; lockUntil: number | null }> = new Map();

  async getAttempts(key: string) {
    return this.store.get(key) || { count: 0, lockUntil: null };
  }

  async increment(key: string) {
    const record = await this.getAttempts(key);
    const newCount = record.count + 1;
    
    // Lock for 15 minutes after 5 attempts
    if (newCount >= 5) {
      const lockUntil = Date.now() + 15 * 60 * 1000;
      this.store.set(key, { count: newCount, lockUntil });
      return { count: newCount, lockUntil };
    }

    this.store.set(key, { count: newCount, lockUntil: null });
    return { count: newCount, lockUntil: null };
  }

  async clear(key: string) {
    this.store.delete(key);
  }
}

export const redisClient = new MockRedis();
