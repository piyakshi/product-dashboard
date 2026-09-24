import { useEffect, useState } from "react";

// Returns `value`, but only updates after `delay` ms of no changes.
// Used so we don't fire an API request on every keystroke.
export function useDebounce(value, delay = 400) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
