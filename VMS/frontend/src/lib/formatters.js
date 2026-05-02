export function currency(v) {
  return typeof v === 'number' ? `$${v.toFixed(2)}` : v
}

export default { currency }
