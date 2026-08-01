/** @type {import('tailwindcss').Config} */
import typography from '@tailwindcss/typography';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#F5F1E8',
        'paper-dark': '#E8E0CE',
        ink: '#1C1B18',
        'ink-faded': '#55524A',
        'stamp-red': '#A3312A',
        'seal-gold': '#B08D3E',
        graphite: '#3A3F44',
      },
      fontFamily: {
        ledger: ['"Source Serif 4"', 'Lora', 'Georgia', 'serif'],
        mono: ['"JetBrains Mono"', '"SFMono-Regular"', 'Consolas', 'monospace'],
        sans: ['Inter', '"Plus Jakarta Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        ledger: '0 18px 42px -32px rgba(28, 27, 24, 0.45)',
        insetPaper: 'inset 0 0 0 1px rgba(28, 27, 24, 0.08)',
      },
    },
  },
  plugins: [
    typography,
  ],
};
