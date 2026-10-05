import React from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  leftAddon?: React.ReactNode
  rightAddon?: React.ReactNode
}

export default function Input({
  label,
  error,
  hint,
  leftAddon,
  rightAddon,
  className = '',
  id,
  ...props
}: InputProps) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined)

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative flex items-center">
        {leftAddon && (
          <div className="absolute left-3 text-gray-400 pointer-events-none">{leftAddon}</div>
        )}
        <input
          id={inputId}
          className={[
            'w-full px-3 py-2 border rounded-lg text-sm transition-all',
            'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
            'disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed',
            'placeholder:text-gray-400',
            error ? 'border-red-400 bg-red-50 focus:ring-red-400' : 'border-gray-300 bg-white',
            leftAddon ? 'pl-9' : '',
            rightAddon ? 'pr-9' : '',
            className,
          ].join(' ')}
          {...props}
        />
        {rightAddon && (
          <div className="absolute right-3 text-gray-400 pointer-events-none">{rightAddon}</div>
        )}
      </div>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      {hint && !error && <p className="mt-1 text-xs text-gray-400">{hint}</p>}
    </div>
  )
}
