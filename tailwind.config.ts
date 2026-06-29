import type { Config } from 'tailwindcss'

/** Tailwind configuration with EventPulse design tokens. */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Brand palette (indigo-based, matches the transactional email templates).
        brand: {
          50: '#eef2ff',
          100: '#e0e7ff',
          500: '#4f46e5',
          600: '#4338ca',
          700: '#3730a3',
        },
        surface: {
          DEFAULT: '#ffffff',
          muted: '#f9fafb',
          border: '#e5e7eb',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config
