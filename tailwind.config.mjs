/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      borderColor: ({ theme }) => ({
        DEFAULT: theme('colors.border'),
      }),
      colors: {
        border: 'var(--border)',
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        // Add all other CSS variables
      }
    },
  },
  plugins: [],
  corePlugins: {
    preflight: false
  }
}
