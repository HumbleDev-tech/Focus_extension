/**
 * Libertad - Bounded Cache Engine
 * Bounded LRU Cache to prevent memory leaks in persistent SPA sessions.
 */

globalThis.Libertad = globalThis.Libertad || {};

(function () {
  'use strict';

  class BoundedCache {
    constructor(maxSize = 300) {
      this.maxSize = maxSize;
      this.map = new Map();
    }
    get(key) {
      if (!this.map.has(key)) return undefined;
      const val = this.map.get(key);
      this.map.delete(key);
      this.map.set(key, val);
      return val;
    }
    set(key, val) {
      if (this.map.has(key)) {
        this.map.delete(key);
      } else if (this.map.size >= this.maxSize) {
        const oldestKey = this.map.keys().next().value;
        this.map.delete(oldestKey);
      }
      this.map.set(key, val);
    }
    has(key) {
      return this.map.has(key);
    }
    clear() {
      this.map.clear();
    }
  }

  globalThis.Libertad.BoundedCache = BoundedCache;
})();
