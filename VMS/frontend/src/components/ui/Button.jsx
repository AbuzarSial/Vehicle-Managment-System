import React from 'react'

export default function Button({ children, ...rest }) {
  return (
    <button {...rest} className="px-4 py-2 bg-blue-600 text-white rounded">
      {children}
    </button>
  )
}
