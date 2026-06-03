import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'forest': '#0B1F17',
        'green-primary': '#2F855A',
        'green-fresh': '#7BC950',
        'gold': '#F2C94C',
        'soil': '#B86B3C',
        'cloud-white': '#F8FAF7',
        'text-muted': '#A7B5AD',
        'alert': '#E4572E',
      },
      fontFamily: {
        sans: ['system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
        'card': '0 4px 6px rgba(0, 0, 0, 0.07), 0 2px 4px rgba(0, 0, 0, 0.05)',
      },
    },
  },
  plugins: [],
}
export default config
