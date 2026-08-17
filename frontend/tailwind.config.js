/** @type {import('tailwindcss').Config} */

// ─── Visual Identity: DataDoctor ─────────────────────────────────────────────
//
// PALETTE (6 named colors):
//   Teal Deep    #0D5E6B   Primary — surgical teal, trust & precision
//   Ivory        #FAFAF8   Base — warm clinical white
//   Signal Coral #E85D3A   Accent/CTA — confident, warm, action
//   Graphite     #1A2332   Text — warm near-black
//   Mint         #34B88B   Success — "data is healthy"
//   Slate        #6B7072   Muted — secondary text, placeholders
//
// TYPEFACES:
//   Display: Space Grotesk — geometric, technical, distinctive character
//   Body:    DM Sans — clean, modern, excellent readability
//
// COMPONENT LANGUAGE: "Surgical Precision"
//   - Hairline 1px warm-tinted borders (no thick borders)
//   - Floating shadow for elevated elements only (dropdowns, modals)
//   - Cards: thin border + no shadow OR shadow + no border
//   - 12px radius (rounded-xl/2xl) — clinical, not bubbly
//   - Transitions: 150ms for interactions, 300ms for layout
//
// SIGNATURE ELEMENT: ECG Pulse Waveform
//   Animated heartbeat line used as decorative motif
// ─────────────────────────────────────────────────────────────────────────────

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {

      // ── Color Palette ────────────────────────────────────────────────
      colors: {

        // PRIMARY — Teal Deep (#0D5E6B)
        // The core brand. Clinical precision. Think surgical scrubs,
        // MRI control rooms, high-end medical devices.
        primary: {
          DEFAULT: '#0D5E6B',
          50:  '#EAF5F7',
          100: '#CCE9ED',
          200: '#96D6DE',
          300: '#5FBFCC',
          400: '#2A9DAD',
          500: '#147886',
          600: '#0D5E6B',   // ← HERO
          700: '#0B4D57',
          800: '#093D45',
          900: '#062D33',
          950: '#041E22',
          dark: '#093D45',
          ghost: '#EAF5F7',
        },

        // ACCENT — Signal Coral (#E85D3A)
        // Confident warm tone for CTAs. Stands apart from the teal
        // without clashing. Think vital-signs monitor highlights.
        accent: {
          DEFAULT: '#E85D3A',
          50:  '#FEF2ED',
          100: '#FDDDD2',
          200: '#FABAA5',
          300: '#F49171',
          400: '#EE7349',
          500: '#E85D3A',   // ← HERO
          600: '#D14425',
          700: '#AE351E',
          800: '#8C2C1C',
          900: '#72271C',
          950: '#3E110B',
          ghost: '#FEF2ED',
        },

        // SUCCESS — Mint (#34B88B)
        // "Healthy data" indicator. Fresh, clean, reassuring.
        mint: {
          DEFAULT: '#34B88B',
          50:  '#ECF9F2',
          100: '#D0F1E1',
          200: '#A4E3C8',
          300: '#6DCFA9',
          400: '#34B88B',   // ← HERO
          500: '#21A077',
          600: '#178061',
          700: '#14664F',
          800: '#135140',
          900: '#114336',
          950: '#08261F',
          dark: '#135140',
          ghost: '#ECF9F2',
        },

        // SURFACE — Warm Neutral Scale
        // Not the default Tailwind gray. Warm-tinted to complement teal.
        surface: {
          DEFAULT: '#FFFFFF',
          50:  '#FAFAF8',   // ← Ivory base
          100: '#F4F3F0',
          200: '#E8E6E2',
          300: '#D4D1CC',
          400: '#9FA3A0',
          500: '#6B7072',   // ← Slate (muted text)
          600: '#4A4E50',
          700: '#353839',
          800: '#252728',
          900: '#1A2332',   // ← Graphite (primary text)
          950: '#0E1315',
        },

        // Danger stays standard red for universal recognition
        danger: {
          DEFAULT: '#DC2626',
          50:  '#FEF2F2',
          100: '#FEE2E2',
          200: '#FECACA',
          300: '#FCA5A5',
          400: '#F87171',
          500: '#EF4444',
          600: '#DC2626',
          700: '#B91C1C',
          800: '#991B1B',
          900: '#7F1D1D',
          950: '#450A0A',
          ghost: '#FEF2F2',
        },

        // TEXT — Semantic text colors (maps to CSS custom properties)
        // Named "text" so Tailwind classes like text-text-muted work.
        text: {
          DEFAULT:   '#1A2332',
          secondary: '#4A4E50',
          muted:     '#6B7072',
          faint:     '#767676',
        },
      },

      // ── Typography ───────────────────────────────────────────────────
      fontFamily: {
        // Space Grotesk — geometric grotesque with technical character.
        // Monospace-adjacent feel without being monospace. Perfect for
        // a data/cleaning platform. Distinctive, not generic.
        display: [
          'Space Grotesk',
          'system-ui',
          '-apple-system',
          'sans-serif',
        ],
        // DM Sans — geometric, clean, highly readable at small sizes.
        // Pairs with Space Grotesk's technical feel while staying warm.
        body: [
          'DM Sans',
          'system-ui',
          '-apple-system',
          'sans-serif',
        ],
        // Mono for data values
        mono: [
          'JetBrains Mono',
          'SF Mono',
          'Fira Code',
          'monospace',
        ],
      },

      // ── Shadows ──────────────────────────────────────────────────────
      // Surgical Precision language:
      // - Cards get hairline borders, NOT shadows
      // - Only floating/elevated elements get shadows
      // - Shadows are warm-tinted, subtle, layered
      boxShadow: {
        // Subtle float — dropdowns, popovers
        'float': '0 4px 24px -4px rgba(26, 35, 50, 0.08), 0 1px 2px rgba(26, 35, 50, 0.04)',
        // Elevated float — modals, dialogs
        'elevated': '0 12px 40px -8px rgba(26, 35, 50, 0.12), 0 2px 6px rgba(26, 35, 50, 0.04)',
        // Glow — CTA hover, focus rings (teal-tinted)
        'glow': '0 0 0 3px rgba(13, 94, 107, 0.15)',
        'glow-accent': '0 0 0 3px rgba(232, 93, 58, 0.2)',
        // Inner — pressed states, inset inputs
        'inner-soft': 'inset 0 1px 3px 0 rgba(26, 35, 50, 0.06)',
      },

      // ── Border Radius ────────────────────────────────────────────────
      // Clinical but not bubbly. 10-12px is the sweet spot.
      borderRadius: {
        'card': '12px',      // Cards, panels
        'widget': '10px',    // Smaller widgets, stat boxes
        'input': '10px',     // Form inputs
        'btn': '10px',       // Buttons
        'pill': '9999px',    // Badges, tags
      },

      // ── Background Patterns ──────────────────────────────────────────
      backgroundImage: {
        // Subtle noise texture for depth
        'noise': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.7' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E\")",
        // Clinical grid pattern (subtle)
        'grid-dots': "radial-gradient(circle, #D4D1CC 0.5px, transparent 0.5px)",
      },

      // ── Animations ───────────────────────────────────────────────────
      animation: {
        'fade-in':          'fadeIn 0.4s ease-out',
        'fade-in-up':       'fadeInUp 0.4s ease-out',
        'slide-in-right':   'slideInRight 0.3s ease-out',
        'slide-in-left':    'slideInLeft 0.3s ease-out',
        'scale-in':         'scaleIn 0.2s ease-out',
        // ECG pulse — the signature animation
        'ecg-draw':         'ecgDraw 2s ease-in-out infinite',
        'ecg-draw-once':    'ecgDrawOnce 1.5s ease-out forwards',
        'ecg-pulse':        'ecgPulse 2s ease-in-out infinite',
        // Subtle breathing effect for status indicators
        'breathe':          'breathe 3s ease-in-out infinite',
        'shimmer':          'shimmer 2s linear infinite',
      },

      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%':   { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%':   { opacity: '0', transform: 'translateX(-12px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideInLeft: {
          '0%':   { opacity: '0', transform: 'translateX(12px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        scaleIn: {
          '0%':   { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        // ECG line draw — stroke-dashoffset animation
        ecgDraw: {
          '0%':   { strokeDashoffset: '1000' },
          '50%':  { strokeDashoffset: '0' },
          '100%': { strokeDashoffset: '-1000' },
        },
        ecgDrawOnce: {
          '0%':   { strokeDashoffset: '1000', opacity: '0' },
          '10%':  { opacity: '1' },
          '100%': { strokeDashoffset: '0', opacity: '1' },
        },
        ecgPulse: {
          '0%, 100%': { opacity: '0.4' },
          '50%':      { opacity: '1' },
        },
        breathe: {
          '0%, 100%': { opacity: '0.6', transform: 'scale(1)' },
          '50%':      { opacity: '1', transform: 'scale(1.02)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
}
