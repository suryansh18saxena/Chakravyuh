/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
        colors: {
            cyber: {
                bg: '#0A0A0F',
                card: '#0D0D1A',
                elevated: '#111128',
                accent: {
                    red: '#E63946',
                    blue: '#4361EE',
                    success: '#2DC653',
                    warning: '#F4A261',
                    gold: '#FFD700'
                },
                text: {
                    primary: '#F0F0F5',
                    secondary: '#8888AA'
                },
                border: '#1E1E3A',
                
                // Severity Badge Backgrounds
                critical: { bg: '#2D0A0C', text: '#FF4444', border: '#E63946' },
                high: { bg: '#2D1A0A', text: '#FF9500', border: '#F4A261' },
                medium: { bg: '#2D2A0A', text: '#FFD700', border: '#FFD700' },
                low: { bg: '#0A1A0D', text: '#2DC653', border: '#2DC653' },
            }
        },
        fontFamily: {
            sans: ['"Inter"', 'sans-serif'],
            heading: ['"Space Grotesk"', 'sans-serif'],
            mono: ['"JetBrains Mono"', 'monospace']
        },
        boxShadow: {
            'glow-red': '0 0 20px rgba(230,57,70,0.12)',
            'glow-blue': '0 0 20px rgba(67, 97, 238, 0.15)',
        },
        transitionDuration: {
            '200': '200ms',
            '400': '400ms'
        },
        spacing: {
            '8': '8px',
            '12': '12px',
            '16': '16px',
            '20': '20px',
            '24': '24px',
            '32': '32px',
            '40': '40px',
            '48': '48px',
        }
    },
  },
  plugins: [],
}
