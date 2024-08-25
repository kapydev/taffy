export function booleanFilter<T>(value: T | undefined | null): value is T {
  return Boolean(value);
}
