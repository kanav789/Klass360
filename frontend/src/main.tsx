import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from '@/context/AuthContext'
import { InstituteProvider } from '@/context/InstituteContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <InstituteProvider>
        <App />
      </InstituteProvider>
    </AuthProvider>
  </StrictMode>,
)
