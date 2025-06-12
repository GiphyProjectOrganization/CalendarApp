import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import { ThemeProvider } from './components/contexts/theme/ThemeContext';
import { APILoader } from '@googlemaps/extended-component-library/react';
import { MAP_API_KEY } from './constants';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error("Root element not found");

createRoot(rootElement).render(
  <StrictMode>
    <APILoader 
      apiKey={MAP_API_KEY} 
      solutionChannel="GMP_GCC_placepicker_v1"
    >
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </APILoader>
  </StrictMode>
);