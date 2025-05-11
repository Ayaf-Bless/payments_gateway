import { Injectable } from '@nestjs/common';

@Injectable()
export class InMemoryCacheService {
  private cache: Map<string, { value: any; expiry: number | null }> = new Map();

  async get<T>(key: string): Promise<T | undefined> {
    const item = this.cache.get(key);

    // Return undefined if key doesn't exist
    if (!item) {
      return undefined;
    }

    // Check if the item has expired
    if (item.expiry && Date.now() > item.expiry) {
      this.del(key);
      return undefined;
    }

    return item.value;
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    const expiry = ttl ? Date.now() + ttl * 1000 : null;
    this.cache.set(key, { value, expiry });
  }

  async del(key: string): Promise<void> {
    this.cache.delete(key);
  }

  async reset(): Promise<void> {
    this.cache.clear();
  }

  // Helper to get cache size (for debugging)
  getCacheSize(): number {
    return this.cache.size;
  }

  // Helper to clean expired entries
  cleanExpired(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (item.expiry && now > item.expiry) {
        this.cache.delete(key);
      }
    }
  }
}
