/**
 * Simple in-memory cache with TTL support
 */
export class Cache<K, V> {
	private cache = new Map<K, V>();
	private lastRefresh = Date.now();
	private readonly ttl: number;

	constructor(ttlMs = 60 * 1000) {
		// Default TTL of 1 minute
		this.ttl = ttlMs;
	}

	get isStale(): boolean {
		return Date.now() - this.lastRefresh > this.ttl;
	}

	get(key: K): V | null {
		return this.cache.get(key) || null;
	}

	set(key: K, value: V): void {
		this.cache.set(key, value);
		this.lastRefresh = Date.now();
	}

	setMany(entries: Array<[K, V]>): void {
		for (const [key, value] of entries) {
			this.cache.set(key, value);
		}
		this.lastRefresh = Date.now();
	}

	clear(): void {
		this.cache.clear();
	}

	get size(): number {
		return this.cache.size;
	}

	values(): V[] {
		return Array.from(this.cache.values());
	}
}
