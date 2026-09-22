import React from 'react'

type BadgeVariant = 'gray' | 'blue' | 'green' | 'red' | 'yellow' | 'indigo' | 'orange' | 'teal'
type BadgeSize = 'sm' | 'md'

interface BadgeProps {
  children: React.ReactNode
  variant?: BadgeVariant
  size?: BadgeSize
  dot?: boolean
  className?: string
}

const variantStyles: Record<BadgeVariant, string> = {
  gray:   'bg-gray-100 text-gray-700',
  blue:   'bg-blue-100 text-blue-700',
  green:  'bg-green-100 text-green-700',
  red:    'bg-red-100 text-red-700',
  yellow: 'bg-yellow-100 text-yellow-700',
  indigo: 'bg-indigo-100 text-indigo-700',
  orange: 'bg-orange-100 text-orange-700',
  teal:   'bg-teal-100 text-teal-700',
}

const dotColors: Record<BadgeVariant, string> = {
  gray:   'bg-gray-500',
  blue:   'bg-blue-500',
  green:  'bg-green-500',
  red:    'bg-red-500',
  yellow: 'bg-yellow-500',
  indigo: 'bg-indigo-500',
  orange: 'bg-orange-500',
  teal:   'bg-teal-500',
}

const sizeStyles: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
}

export default function Badge({
  children,
  variant = 'gray',
  size = 'sm',
  dot = false,
  className = '',
}: BadgeProps) {
  return (
    <span className={[
      'inline-flex items-center gap-1.5 font-medium rounded-full',
      variantStyles[variant],
      sizeStyles[size],
      className,
    ].join(' ')}>
      {dot && (
        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dotColors[variant]}`} />
      )}
      {children}
    </span>
  )
}
