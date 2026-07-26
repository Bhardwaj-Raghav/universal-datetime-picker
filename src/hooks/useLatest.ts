import { useRef } from "react";

/** Keeps a ref to the latest value (for stable effect deps with fresh callbacks). */
export function useLatest<T>(value: T): { readonly current: T } {
  const ref = useRef(value);
  ref.current = value;
  return ref;
}
