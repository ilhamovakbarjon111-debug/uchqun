/** @type {import('tailwindcss').Config} */
import colors from 'tailwindcss/colors';

const brandBlue = {
  50: '#eff6ff',
  100: '#dbeafe',
  200: '#bfdbfe',
  300: '#93c5fd',
  400: '#60a5fa',
  500: '#3b82f6',
  600: '#2563eb',
  700: '#1d4ed8',
  800: '#1e40af',
  900: '#1e3a8a',
};

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    // Important: define colors at top-level (not only extend) to ensure defaults are overridden.
    colors: {
      ...colors,
      orange: brandBlue,
      primary: brandBlue,
    },
    extend: {
      animation: {
        'slide-in': 'slideIn 0.3s ease-out',
      },
      keyframes: {
        slideIn: {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
      },
    }
  },
  plugins: [],
}



