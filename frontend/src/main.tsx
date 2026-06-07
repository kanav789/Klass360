import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from '@/context/AuthContext'
import { BranchFilterProvider } from '@/context/BranchFilterContext'
import { InstituteProvider } from '@/context/InstituteContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <InstituteProvider>
        <BranchFilterProvider>
          <App />
        </BranchFilterProvider>
      </InstituteProvider>
    </AuthProvider>
  </StrictMode>,
)
