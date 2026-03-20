/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#00F2FE",
        secondary: "#4FACFE",
        accent: "#10B981",
        void: "#0B0E14",
        card: "rgba(15, 23, 42, 0.7)",
      },
      fontFamily: {
        sans: ['Outfit', 'sans-serif'],
        display: ['Space Grotesk', 'sans-serif'],
      },
      backgroundImage: {
        'universe': "radial-gradient(circle at top right, rgba(79, 172, 254, 0.15) 0%, transparent 60%), radial-gradient(circle at bottom left, rgba(0, 242, 254, 0.15) 0%, transparent 60%)",
      }
    },
  },
  plugins: [],
}
