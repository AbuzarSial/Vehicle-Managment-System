import React from 'react'
import Input from '../../../components/ui/Input'

/**
 * Search box filters the in-memory list (backend has no text search yet).
 */
export default function CustomerFilters({ value, onChange, disabled }) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
      <div className="w-full max-w-md">
        <label htmlFor="customer-search" className="mb-1 block text-xs font-medium text-slate-600">
          Search
        </label>
        <Input
          id="customer-search"
          type="search"
          placeholder="Name, email, or phone"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          autoComplete="off"
        />
      </div>
    </div>
  )
}
