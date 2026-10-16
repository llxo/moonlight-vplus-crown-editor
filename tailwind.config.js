/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        crown: {
          50: "#fffbeb",
          100: "#fef3c7",
          400: "#fbbf24",
          500: "#f59e0b",
          600: "#d97706",
        },
        panel: {
          bg: "#121316",
          header: "#18191d",
          sidebar: "#15161a",
          border: "#282a30",
          card: "#1e2025",
          hover: "#252830",
          active: "#2e323b",
        },
      },
    },
  },
  plugins: [],
};
