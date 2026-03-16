// src/main.tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import App from './App';
import './index.css';
import { DocumentHead } from './components/Documenthead';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HelmetProvider>
      <DocumentHead />
      <App />
    </HelmetProvider>
  </StrictMode>
);