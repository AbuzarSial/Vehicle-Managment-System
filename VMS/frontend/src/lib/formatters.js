/** Format amounts in Pakistani Rupees for display (API values remain numeric). */
export function currency(v) {
  if (typeof v !== 'number' || Number.isNaN(v)) return v
  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'PKR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(v)
}

/** API date or ISO datetime → DD-MM-YYYY (display only; API stays ISO). */
export function formatDate(isoDate) {
  if (!isoDate) return '—'
  const s = String(isoDate)
  const datePart = s.length >= 10 ? s.slice(0, 10) : s
  const d = new Date(`${datePart}T12:00:00`)
  if (Number.isNaN(d.getTime())) return s
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const yyyy = d.getFullYear()
  return `${dd}-${mm}-${yyyy}`
}

/** ISO datetime from API → DD-MM-YYYY, HH:mm (24h). */
export function formatDateTime(isoString) {
  if (!isoString) return '—'
  const d = new Date(isoString)
  if (Number.isNaN(d.getTime())) return isoString
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const yyyy = d.getFullYear()
  const hh = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  return `${dd}-${mm}-${yyyy}, ${hh}:${min}`
}

export default { currency, formatDate, formatDateTime }
