import type { Config } from 'tailwindcss';

interface ExtendedConfig extends Config {
  daisyui?: {
    themes?: any;
  };
}

const config: ExtendedConfig = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        cubao: ['CubaoRegular', 'sans-serif'],
      },
    },
  },
  daisyui: {
    themes: ["honey", "forest", "ocean"],
  },
  plugins: [require('daisyui')],
};

export default config;
