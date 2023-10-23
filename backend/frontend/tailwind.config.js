/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx,vue}",
  ],
  theme: {
      colors: {
          'grey-bg': "#1f1f1f",
          'red-accent': "#800000",
          'green-text': "#51e800",
          'white-text': "#dedede",
          'red-toast': "#c22f0e",
          'orange-toast': "#e08607",
          'yellow-toast': "#e0ce07",
          'green-toast': "#2a9403",
      },
      extend: {},
  },
  plugins: [],
  prefix: 'tw-'
}