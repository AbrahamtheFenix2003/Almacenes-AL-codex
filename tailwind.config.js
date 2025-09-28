/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "boston-blue": {
          50: "#e8f2fb",
          100: "#c8e1f7",
          200: "#90c8f0",
          300: "#5db1e3",
          400: "#5099c5",
          500: "#4687af",
          600: "#396f90",
          700: "#2a5570",
          800: "#1b3b4e",
          900: "#0c202c",
          950: "#05121b",
        },
      },
      boxShadow: {
        panel: "0 20px 40px -24px rgba(28, 85, 112, 0.35)",
      },
      borderRadius: {
        panel: "1.25rem",
      },
    },
  },
  plugins: [],
};
