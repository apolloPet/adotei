
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import './index.css'
import { webhookService } from './services/webhookService'
import { AuthProvider } from './hooks/auth/AuthProvider'

// Inicializa o serviço de webhooks para que eventos possam ser capturados
webhookService.initWebhookListeners();

// Se estiver em ambiente de desenvolvimento, configura notificações para admins
if (import.meta.env.DEV) {
  const unsubscribe = webhookService.setupAdminNotifications();
  
  // Limpa assinaturas quando a aplicação for descarregada
  window.addEventListener('beforeunload', () => {
    unsubscribe();
  });
}

// Create root element and ensure it exists
const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Root element with id 'root' not found in the DOM");
}

const root = ReactDOM.createRoot(rootElement);

// Render with proper provider hierarchy
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
