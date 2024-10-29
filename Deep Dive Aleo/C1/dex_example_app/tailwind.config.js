/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',  // Vite uses index.html as the entry point
    './src/**/*.{js,ts,jsx,tsx}', // Include all JS/TSX files in src
  ],
  theme: {
    extend: {
      dropShadow: {
        'custom': '0 0 2em #dfe0ebaa',
        'react': '0 0 2em #61dafbaa',
      },
    },
  },
  plugins: [],
};
