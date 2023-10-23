/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        colors: {
            'grey-background': "#292929"
        },
        extend: {},
    },
    plugins: [],
    prefix: 'tw-'
  }