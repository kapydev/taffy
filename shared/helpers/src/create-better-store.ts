import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

export function createBetterStore<T extends Record<string, any>>(
  storeDefaults: T
) {
  const useStore = create<T>()(
    subscribeWithSelector((set, get) => storeDefaults)
  );
  const use = <K extends keyof T, V extends T[K]>(key: K) =>
    useStore((state) => state[key]) as V;
  const set = <K extends keyof T, V extends T[K]>(key: K, val: V) => {
    useStore.setState({ [key]: val } as Partial<T>);
  };
  const get = <K extends keyof T, V extends T[K]>(key: K) =>
    useStore.getState()[key] as V;
  const subscribe = <K extends keyof T, V extends T[K]>(
    key: K,
    listener: (newVal: V, oldVal: V) => void
  ) => useStore.subscribe((state) => state[key], listener);

  return { use, set, get, subscribe, useStore };
}
