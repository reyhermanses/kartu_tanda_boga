/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      borderRadius: {
        card: "14px",
      },
      boxShadow: {
        card: "0 8px 16px rgba(0,0,0,0.15)",
      },
    },
  },
  plugins: [],
}

