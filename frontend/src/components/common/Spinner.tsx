import clsx from 'clsx'

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
  color?: 'primary' | 'accent' | 'white'
}

export default function Spinner({ size = 'md', className, color = 'primary' }: SpinnerProps) {
  const colorMap: Record<string, string> = {
    primary: 'border-surface-200 border-t-primary-600',
    accent:  'border-surface-200 border-t-accent-500',
    white:   'border-white/30 border-t-white',
  }

  return (
    <div
      role="status"
      aria-label="Loading"
      className={clsx(
        'animate-spin rounded-full border-2',
        colorMap[color],
        {
          'w-4 h-4 border-[1.5px]': size === 'sm',
          'w-6 h-6': size === 'md',
          'w-10 h-10 border-[3px]': size === 'lg',
        },
        className
      )}
    />
  )
}
