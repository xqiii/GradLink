/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#4A71C0',
          light: '#6B8FD4',
          dark: '#3A5A9A',
          50: '#E6F0FF',
          100: '#CCE1FF',
          200: '#99C3FF',
          300: '#66A5FF',
          400: '#3387FF',
          500: '#4A71C0',
          600: '#3A5A9A',
          700: '#2B4473',
          800: '#1D2E4D',
          900: '#0E1726',
        },
      },
    },
  },
  plugins: [],
  // 重要：确保 Tailwind 的样式优先级高于 Ant Design
  corePlugins: {
    preflight: false, // 禁用 Tailwind 的默认样式重置，避免与 Ant Design 冲突
  },
}

