import clsx from 'clsx'

interface ECGProps {
  className?: string
  animate?: boolean
  color?: string
  height?: number
}

/*
 * Classic PQRST waveform — the ECG signature.
 * 
 * The path creates one full heartbeat cycle:
 * P wave (atrial depolarization) → QRS complex (ventricular depolarization)
 * → T wave (ventricular repolarization) → flat baseline
 *
 * This is DataDoctor's visual metaphor: "checking the vital signs of your data."
 */
export default function ECG({ 
  className, 
  animate = true, 
  color,
  height = 60 
}: ECGProps) {
  // PQRST waveform — single heartbeat cycle
  // Flat → small P bump → flat → sharp QRS spike → flat → gentle T wave → flat
  const pqrstPath = `
    M 0 40
    L 40 40
    Q 55 40, 60 35
    Q 65 30, 70 40
    L 90 40
    L 100 43
    L 105 40
    L 115 8
    L 125 65
    L 135 35
    L 140 40
    L 180 40
    Q 195 40, 200 34
    Q 205 28, 210 40
    L 260 40
  `

  return (
    <div className={clsx('ecg-container', animate ? 'ecg-animated' : 'ecg-draw', className)}
         style={{ height: `${height}px` }}>
      <svg 
        className="ecg-line" 
        viewBox="0 0 260 80" 
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* Faint baseline grid lines */}
        <line x1="0" y1="40" x2="260" y2="40" 
              stroke="currentColor" strokeWidth="0.5" opacity="0.1" />
        
        {/* The heartbeat waveform */}
        <path 
          className="ecg-path" 
          d={pqrstPath}
          style={color ? { stroke: color } : undefined}
        />
        
        {/* Pulse dot at the peak of QRS */}
        {animate && (
          <circle 
            cx="115" cy="8" r="3" 
            fill="var(--color-accent)"
            className="animate-breathe"
          />
        )}
      </svg>
    </div>
  )
}
