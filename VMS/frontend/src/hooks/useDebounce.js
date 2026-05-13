import { useEffect, useState } from 'react'

/**
 * Returns `value` only after it has stayed unchanged for `delayMs` milliseconds.
 */
export default function useDebounce(value, delayMs = 300) {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delayMs)
    return () => clearTimeout(id)
  }, [value, delayMs])

  return debounced
}
