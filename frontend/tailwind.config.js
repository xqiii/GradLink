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

