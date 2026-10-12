import type { Config } from 'tailwindcss';
import preset from '@ecommerce/config/tailwind/preset.js';

/**
 * Storefront theme ("Bazaar Bright"). Only the web app uses these values: the shared
 * @ecommerce/ui components are compiled per app, so admin and vendor keep the base preset.
 */
const config: Config = {
  presets: [preset],
  content: ['./src/**/*.{ts,tsx}', '../../packages/ui/src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Violet — oklch(0.52 0.22 285) is 600 (primary buttons, header).
        brand: {
          50: '#f3f4ff',
          100: '#ebebff',
          200: '#d8d7ff',
          300: '#bcb9ff',
          400: '#958aff',
          500: '#7963f5',
          600: '#6445df',
          700: '#532bc7',
          800: '#40239b',
          900: '#2e1b72',
          950: '#1b0f49',
        },
        // Signal yellow — oklch(0.88 0.17 92): search button, discount pills, highlights.
        accent: { DEFAULT: '#ffd32e', soft: '#ffefb1', strong: '#f2bc00' },
        // Violet-tinted neutrals: ink #1B1830, muted #6C6883, lines #E6E3F0, canvas #F5F4FA.
        gray: {
          50: '#f5f4fa',
          100: '#eeecf5',
          200: '#e6e3f0',
          300: '#d4d0e3',
          400: '#a7a1c9',
          500: '#6c6883',
          600: '#4a4663',
          700: '#3a3652',
          800: '#2a2642',
          900: '#1b1830',
          950: '#110f20',
        },
        // Soft tiles (categories, trust badges, store avatars).
        tint: {
          violet: '#e3e3ff',
          yellow: '#f6e7bb',
          mint: '#c6f5da',
          rose: '#ffd9d7',
          sky: '#c0f0ff',
          pink: '#ffdafb',
        },
      },
      borderRadius: {
        lg: '0.875rem',
        xl: '1rem',
        '2xl': '1.375rem',
        '3xl': '1.75rem',
        '4xl': '2rem',
      },
      boxShadow: {
        card: '0 14px 34px -16px rgba(60, 40, 140, 0.35)',
      },
      letterSpacing: {
        display: '-0.04em',
        heading: '-0.03em',
      },
    },
  },
};

export default config;
