import { ReactNode } from 'react'
import clsx from 'clsx'

interface CardProps {
  children: ReactNode
  className?: string
  padding?: 'none' | 'sm' | 'md' | 'lg'
  hover?: boolean
  elevated?: boolean
}

export default function Card({ children, className, padding = 'md', hover = false, elevated = false }: CardProps) {
  const paddings: Record<string, string> = {
    none: 'p-0',
    sm:   'p-4',
    md:   'p-6',
    lg:   'p-8',
  }

  return (
    <div
      className={clsx(
        elevated ? 'card-elevated' : 'card',
        hover && 'card-hover',
        paddings[padding],
        className
      )}
    >
      {children}
    </div>
  )
}
