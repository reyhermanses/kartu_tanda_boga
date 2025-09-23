import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Add error handling
try {
  const rootElement = document.getElementById('root')
  if (!rootElement) {
    throw new Error('Root element not found')
  }
  
  console.log('Starting app...')
  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
  console.log('App rendered successfully')
} catch (error) {
  console.error('Error rendering app:', error)
  document.body.innerHTML = '<div style="color: red; padding: 20px;">Error loading app: ' + error + '</div>'
}
