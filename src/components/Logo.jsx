import React from 'react'

export default function Logo({ size = 40, showText = true }) {
  return (
    <div className="flex items-center gap-3">
      <img
        src="/logo.svg"
        alt="Logo"
        style={{ width: size, height: size }}
        className="shrink-0"
      />
      {showText && (
        <span className="text-xl sm:text-2xl font-bold text-gray-900">
          Video Interview
        </span>
      )}
    </div>
  )
}


