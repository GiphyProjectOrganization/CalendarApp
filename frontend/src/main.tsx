import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import { ThemeProvider } from './components/contexts/theme/ThemeContext';
import { LoadScript } from '@react-google-maps/api';
import { MAP_API_KEY } from './constants';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error("Root element not found");

createRoot(rootElement).render(
  <StrictMode>
    <LoadScript googleMapsApiKey={MAP_API_KEY} libraries={["places"]}>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </LoadScript>
  </StrictMode>
);