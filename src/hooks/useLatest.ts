import { useRef } from "react";

/**
 * Always holds the latest value. Lets stable callbacks (useCallback with no deps)
 * read fresh props/state without being re-created on every change, which keeps
 * memoized list rows from re-rendering.
 */
export function useLatest<T>(value: T) {
  const ref = useRef(value);
  ref.current = value;
  return ref;
}
