/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Enable class-based dark mode
  theme: {
    extend: {
      colors: {
        // Dark Glassy Theme
        glass: {
          dark: '#1e293b',      // Main background
          darker: '#0f172a',    // Darker sections
          card: 'rgba(30, 41, 59, 0.6)',  // Glass cards
          border: 'rgba(148, 163, 184, 0.1)', // Subtle borders
        },
        
        // Cyan/Teal Primary (like the reference)
        primary: {
          DEFAULT: '#22d3ee',   // Cyan 400
          light: '#67e8f9',
          dark: '#06b6d4',
        },
        
        // Success/Active States
        success: {
          DEFAULT: '#10b981',
          light: '#34d399',
          dark: '#059669',
        },
        
        // Warning States
        warning: {
          DEFAULT: '#f59e0b',
          light: '#fbbf24',
          dark: '#d97706',
        },
        
        // Error/Danger States
        error: {
          DEFAULT: '#ef4444',
          light: '#f87171',
          dark: '#dc2626',
        },
        
        // Coral Accent (from reference design)
        coral: {
          DEFAULT: '#f97066',
          light: '#fca5a0',
          dark: '#f05045',
        },
        
        // Neutral/Gray Scale
        neutral: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
