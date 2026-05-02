import React from 'react'

export default function EmptyState({ message = 'No data' }) {
  return <div className="text-center py-10 text-gray-500">{message}</div>
}
