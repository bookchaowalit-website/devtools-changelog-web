// A tiny browser-local store for useSyncExternalStore.
// The server (and the first client render during hydration) sees the seed; the browser then reads localStorage.
// Storage failures (private mode, quota, blocked site data) fall back to in-memory state.

export type LocalStore<T> = {
  subscribe: (listener: () => void) => () => void;
  getSnapshot: () => T;
  getServerSnapshot: () => T;
  update: (next: (current: T) => T) => void;
};

type StorageLike = Pick<Storage, "getItem" | "setItem">;

export function createLocalStore<T>(options: {
  key: string;
  seed: T;
  parse: (raw: string | null) => T | null;
  serialize: (value: T) => string;
  storage?: () => StorageLike | undefined;
}): LocalStore<T> {
  const storage = options.storage ?? (() => (typeof window === "undefined" ? undefined : window.localStorage));
  const listeners = new Set<() => void>();
  let cache: T | undefined;

  function read(): T {
    try {
      return options.parse(storage()?.getItem(options.key) ?? null) ?? options.seed;
    } catch {
      return options.seed;
    }
  }

  // The value an update must build on: what is stored now (another tab may have written since this tab cached),
  // or this tab's cached value when nothing is stored yet or storage refuses to be read.
  function latest(cached: T): T {
    try {
      const raw = storage()?.getItem(options.key);
      if (raw == null) return cached;
      return options.parse(raw) ?? cached;
    } catch {
      return cached;
    }
  }

  return {
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    getSnapshot() {
      if (cache === undefined) cache = read();
      return cache;
    },
    getServerSnapshot() {
      return options.seed;
    },
    update(next) {
      cache = next(latest(this.getSnapshot()));
      try {
        storage()?.setItem(options.key, options.serialize(cache));
      } catch {
        // Keep the in-memory value when the browser refuses to store it.
      }
      for (const listener of listeners) listener();
    },
  };
}
