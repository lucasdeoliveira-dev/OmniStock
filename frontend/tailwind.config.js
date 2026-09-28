/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        base: {
          950: "#0B0B10",
          900: "#0F0D17",
          800: "#13111C",
          700: "#14121F",
          600: "#1C182B",
        },
      },
    },
  },
  plugins: [],
};
