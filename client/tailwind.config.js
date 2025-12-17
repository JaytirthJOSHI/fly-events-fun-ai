/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Hack Club brand colors
        'hc-red': '#ec3750',
        'hc-orange': '#ff8c37',
        'hc-yellow': '#f1c40f',
        'hc-green': '#33d6a6',
        'hc-cyan': '#5bc0de',
        'hc-blue': '#338eda',
        'hc-purple': '#a633d6',
        // Grays
        'hc-darker': '#121217',
        'hc-dark': '#17171d',
        'hc-darkless': '#252429',
        'hc-black': '#1f2d3d',
        'hc-steel': '#273444',
        'hc-slate': '#3c4858',
        'hc-muted': '#8492a6',
        'hc-smoke': '#e0e6ed',
        'hc-snow': '#f9fafc',
        'hc-white': '#ffffff',
        // Semantic
        'hc-primary': '#ec3750',
        'hc-accent': '#338eda',
        'hc-elevated': '#ffffff',
        'hc-sheet': '#f9fafc',
        'hc-sunken': '#e0e6ed',
        'hc-border': '#d1d9e6',
      },
      fontFamily: {
        'phantom': ['"Phantom Sans"', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
      },
      borderRadius: {
        'hc': '8px',
        'hc-lg': '12px',
        'hc-xl': '16px',
        'hc-full': '9999px',
      },
      boxShadow: {
        'hc-card': '0 4px 8px rgba(0, 0, 0, 0.125)',
        'hc-elevated': '0 1px 2px rgba(0, 0, 0, 0.0625), 0 8px 12px rgba(0, 0, 0, 0.125)',
      },
    },
  },
  plugins: [],
}
