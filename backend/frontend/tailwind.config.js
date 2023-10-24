/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx,vue}",
  ],
  theme: {
      colors: {
          'grey': "#151515",
          'red': "#800000",
          'green': "#51e800",
          'white': "#dedede",
          'white-hover': "#ffffff",
          'orange': "#e08607",
          'yellow': "#e0ce07",
          'green': "#2a9403",
          'grey-hover': "#3E3E3E",
      },
      extend: {},
  },
  plugins: [],
  prefix: 'tw-'
}