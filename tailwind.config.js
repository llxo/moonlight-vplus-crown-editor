/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bone: {
          DEFAULT: "#f7f6f3",
          light: "#fbfbfa",
          hover: "#efeeea",
        },
        surface: "#ffffff",
        border: {
          DEFAULT: "#eaeaea",
          subtle: "rgba(0, 0, 0, 0.06)",
          hover: "#dcdbd8",
        },
        charcoal: {
          DEFAULT: "#111111",
          secondary: "#2f3437",
          muted: "#787774",
          faint: "#9b9a97",
        },
        pastel: {
          blue: "#e1f3fe",
          "blue-text": "#1f6c9f",
          green: "#edf3ec",
          "green-text": "#346538",
          yellow: "#fbf3db",
          "yellow-text": "#956400",
          red: "#fdebec",
          "red-text": "#9f2f2d",
          purple: "#f3eff5",
          "purple-text": "#5c3e75",
        },
      },
    },
  },
  plugins: [],
};
