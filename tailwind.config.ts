import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}', 
  ],
  theme: {
    extend: {
      colors: {
        straw: "#D9D98F",
        citron: "#C2C658",
        olivine: "#9AB659",
        mossGreen: "#768E3E",
        field: "#78662B",
        darkBrown: "#47401F",
        darkPurple: "#2B121E"
      }
    },
  },
  plugins: [require('daisyui')],
};

export default config;
