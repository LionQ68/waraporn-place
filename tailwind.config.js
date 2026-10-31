/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#1D1E20",
        gold: "#E8C189",
        canvas: "#F6F7F9",
      },
      boxShadow: {
        card: "0 12px 34px rgba(29, 30, 32, 0.07)",
      },
    },
  },
  plugins: [],
};
