
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import './index.css'
import { webhookService } from './services/webhookService'

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

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)
