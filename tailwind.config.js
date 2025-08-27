/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
      },
      colors: {
        background: '#FFFFFF',
        'text-primary': '#1F2937',
        'pink-primary': '#EC4899',
        'pink-light': '#FBCFE8',
        'border-neutral': '#E5E7EB',
      },
    },
  },
  plugins: [],
}