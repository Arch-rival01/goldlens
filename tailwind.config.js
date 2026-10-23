/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Institutional Trading Platform Palette
        charcoal: {
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B',
          600: '#475569',
          700: '#334155',
          800: '#1E293B',
          900: '#0F172A', // Deep institutional charcoal gray
          950: '#090D16',
          DEFAULT: '#0F172A',
        },
        navy: {
          50: '#F0F4F8',
          100: '#D9E2EC',
          200: '#BCCCDC',
          300: '#9FB3C8',
          400: '#627D98',
          500: '#334E68',
          600: '#243B53',
          700: '#1E293B', // Muted institutional navy
          800: '#162335',
          900: '#0F172A',
          950: '#0A0F1D',
          DEFAULT: '#1E293B',
        },
        // Cool blue accent for interface controls; chart series keep their own colors.
        brand: {
          50: '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
          800: '#1E40AF',
          900: '#1E3A8A',
          950: '#172554',
          DEFAULT: '#2563EB',
        },
        // Professional Seafoam Teal (#0D9488)
        seafoam: {
          50: '#F0FDFA',
          100: '#CCFBF1',
          200: '#99F6E4',
          300: '#5EEAD4',
          400: '#2DD4BF',
          500: '#0D9488', // Professional Seafoam Teal
          600: '#0F766E',
          700: '#115E59',
          800: '#134E4A',
          900: '#042F2E',
          950: '#021B1A',
          DEFAULT: '#0D9488',
        },
        // Keep legacy amber utility names on the restrained interface accent scale.
        amber: {
          50: '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
          800: '#1E40AF',
          900: '#1E3A8A',
          950: '#172554',
          DEFAULT: '#2563EB',
        },
        // Remap teal to professional seafoam teal
        teal: {
          50: '#F0FDFA',
          100: '#CCFBF1',
          200: '#99F6E4',
          300: '#5EEAD4',
          400: '#2DD4BF', // Seafoam text highlight (passes 7+:1 AA against dark background)
          500: '#0D9488', // Professional Seafoam Teal
          600: '#0F766E',
          700: '#115E59',
          800: '#134E4A',
          900: '#042F2E',
          DEFAULT: '#0D9488',
        },
      },
    },
  },
  plugins: [],
};
