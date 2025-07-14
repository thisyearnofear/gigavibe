import type { Config } from 'tailwindcss'
import defaultTheme from 'tailwindcss/defaultTheme'

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', ...defaultTheme.fontFamily.sans],
        display: ['var(--font-cal)', ...defaultTheme.fontFamily.sans],
        mono: ['var(--font-mono)', ...defaultTheme.fontFamily.mono],
        comic: ['var(--font-comic)', ...defaultTheme.fontFamily.sans],
        fredoka: ['var(--font-fredoka)', ...defaultTheme.fontFamily.sans],
      },
      colors: {
        // GIGAVIBE Brand Colors
        gigavibe: {
          50: '#fdf4ff',
          100: '#fae8ff',
          200: '#f5d0fe',
          300: '#f0abfc',
          400: '#e879f9',
          500: '#d946ef', // Primary brand color
          600: '#c026d3',
          700: '#a21caf',
          800: '#86198f',
          900: '#701a75',
          950: '#4a044e',
        },
        // Secondary accent colors
        accentSecondary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
          950: '#082f49',
        },
        // Neutral colors for dark theme
        dark: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        },
        // Redesigned shadcn colors
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        'ring-offset-background': 'hsl(var(--background))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      backgroundImage: {
        'gigavibe-gradient': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'gigavibe-glow': 'radial-gradient(circle at 50% 50%, rgba(212, 70, 239, 0.3) 0%, transparent 50%)',
        'gigavibe-mesh': 'radial-gradient(at 40% 20%, rgb(120, 53, 196) 0px, transparent 50%), radial-gradient(at 80% 0%, rgb(255, 0, 153) 0px, transparent 50%), radial-gradient(at 0% 50%, rgb(0, 204, 255) 0px, transparent 50%)',
        'gigavibe-aurora': 'linear-gradient(45deg, #ff006e, #8338ec, #3a86ff, #06ffa5)',
      },
      boxShadow: {
        'gigavibe-glow': '0 0 50px rgba(212, 70, 239, 0.3)',
        'gigavibe-card': '0 8px 32px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(255, 255, 255, 0.05)',
        'gigavibe-button': '0 4px 16px rgba(212, 70, 239, 0.4)',
        'gigavibe-inner': 'inset 0 2px 4px rgba(0, 0, 0, 0.1)',
      },
      animation: {
        'gigavibe-pulse': 'gigavibe-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'gigavibe-bounce': 'gigavibe-bounce 1s ease-in-out infinite',
        'gigavibe-spin': 'gigavibe-spin 3s linear infinite',
        'gigavibe-glow': 'gigavibe-glow 2s ease-in-out infinite alternate',
        'gigavibe-float': 'gigavibe-float 3s ease-in-out infinite',
        'gigavibe-dance': 'gigavibe-dance 4s ease-in-out infinite',
      },
      keyframes: {
        'gigavibe-pulse': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        'gigavibe-bounce': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'gigavibe-spin': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        'gigavibe-glow': {
          '0%': { boxShadow: '0 0 20px rgba(212, 70, 239, 0.5)' },
          '100%': { boxShadow: '0 0 40px rgba(212, 70, 239, 0.8)' },
        },
        'gigavibe-float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'gigavibe-dance': {
          '0%, 100%': { transform: 'translateX(0px) rotate(0deg)' },
          '25%': { transform: 'translateX(-5px) rotate(-2deg)' },
          '50%': { transform: 'translateX(0px) rotate(0deg)' },
          '75%': { transform: 'translateX(5px) rotate(2deg)' },
        },
      },
      blur: {
        xs: '2px',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '112': '28rem',
        '128': '32rem',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
        '4xl': '2.5rem',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}

export default config