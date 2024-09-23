import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { subscribeWithSelector } from 'zustand/middleware';
import { vscApi } from '../common/vsc-api';

export function createBetterStore<T extends Record<string, any>>(
  storeDefaults: T,
  opts?: {
    persistKey?: string;
  }
) {
  const useStore = opts?.persistKey
    ? create<T>()(
        subscribeWithSelector(
          persist((set, get) => storeDefaults, {
            name: opts.persistKey,
            storage: createJSONStorage(() => ({
              getItem: (name: string) => vscApi.getState()?.[name],
              setItem: (name: string, value: string) => {
                vscApi.setState({ ...vscApi.getState(), [name]: value });
              },
              removeItem: (name: string) => {
                const currentState = vscApi.getState();
                if (currentState) {
                  const { [name]: _, ...newState } = currentState;
                  vscApi.setState(newState);
                }
              },
            })),
          })
        )
      )
    : create<T>()(subscribeWithSelector((set, get) => storeDefaults));
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
