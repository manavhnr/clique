/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./screens/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Clique Brand Colors - White Background Black Text Theme
        primary: '#000000', // Black
        accent: '#374151', // Dark Gray
        bg: '#FFFFFF', // Pure White
        panel: '#F9FAFB', // Light Gray
        muted: '#6B7280', // Muted text
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['Fira Code', 'monospace'],
      },
      boxShadow: {
        glow: '0 0 20px rgba(0, 0, 0, 0.1)',
        'glow-lg': '0 0 40px rgba(0, 0, 0, 0.15)',
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #000000, #374151)',
        'gradient-light': 'linear-gradient(135deg, #FFFFFF, #F9FAFB)',
      },
    },
  },
  plugins: [],
}