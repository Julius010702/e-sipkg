import { statusDataColor, statusDataLabel } from '@/lib/utils'

interface StatusBadgeProps {
  status: string
  className?: string
}

export default function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusDataColor(status)} ${className}`}>
      {statusDataLabel(status)}
    </span>
  )
}
