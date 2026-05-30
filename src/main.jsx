import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Toaster } from 'react-hot-toast'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 3000,
        style: {
          background: '#1F2937',
          color: '#fff',
          border: '1px solid #374151',
          borderRadius: '12px',
        },
        success: {
          iconTheme: { primary: '#6366F1', secondary: '#fff' },
        },
        error: {
          iconTheme: { primary: '#EF4444', secondary: '#fff' },
        },
      }}
    />
  </StrictMode>
)