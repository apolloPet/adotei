
/**
 * Serviço para gerenciar webhooks e notificações para eventos importantes do sistema
 * Implementa o padrão de observer para eventos como novas adoções, solicitações de parceria, etc.
 */

type EventCallback = (data: any) => void;
type EventType = 
  | 'adoption:created' 
  | 'adoption:updated' 
  | 'partnership:created' 
  | 'partnership:updated'
  | 'user:registered'
  | 'supplier:created'
  | 'animal:registered';

// Armazena os assinantes por tipo de evento
const subscribers: Record<string, EventCallback[]> = {};

/**
 * Registra um listener para um tipo específico de evento
 */
export const subscribe = (eventType: EventType, callback: EventCallback): () => void => {
  // Inicializa array se não existir
  if (!subscribers[eventType]) {
    subscribers[eventType] = [];
  }
  
  // Adiciona callback à lista de assinantes
  subscribers[eventType].push(callback);
  
  console.log(`[WebhookService] Novo assinante para evento '${eventType}', total: ${subscribers[eventType].length}`);
  
  // Retorna função para cancelar assinatura
  return () => {
    subscribers[eventType] = subscribers[eventType].filter(cb => cb !== callback);
    console.log(`[WebhookService] Assinante removido do evento '${eventType}', restantes: ${subscribers[eventType].length}`);
  };
};

/**
 * Notifica todos os assinantes sobre um evento
 */
export const publish = (eventType: EventType, data: any): void => {
  if (!subscribers[eventType]) {
    console.log(`[WebhookService] Nenhum assinante para evento '${eventType}'`);
    return;
  }
  
  console.log(`[WebhookService] Notificando ${subscribers[eventType].length} assinantes sobre '${eventType}'`);
  
  // Notifica cada assinante
  subscribers[eventType].forEach(callback => {
    try {
      callback(data);
    } catch (error) {
      console.error(`[WebhookService] Erro ao notificar assinante sobre '${eventType}':`, error);
    }
  });
};

/**
 * Inicializa os listeners de eventos do DOM
 */
export const initWebhookListeners = (): void => {
  // Implementa listeners para eventos personalizados do DOM
  window.addEventListener('partnership:created', (event: any) => {
    console.log('[WebhookService] Evento partnership:created capturado');
    publish('partnership:created', event.detail);
  });
  
  window.addEventListener('adoption:created', (event: any) => {
    console.log('[WebhookService] Evento adoption:created capturado');
    publish('adoption:created', event.detail);
  });
  
  window.addEventListener('adoption:updated', (event: any) => {
    console.log('[WebhookService] Evento adoption:updated capturado');
    publish('adoption:updated', event.detail);
  });
  
  window.addEventListener('user:registered', (event: any) => {
    console.log('[WebhookService] Evento user:registered capturado');
    publish('user:registered', event.detail);
  });
  
  window.addEventListener('supplier:created', (event: any) => {
    console.log('[WebhookService] Evento supplier:created capturado');
    publish('supplier:created', event.detail);
  });
  
  window.addEventListener('animal:registered', (event: any) => {
    console.log('[WebhookService] Evento animal:registered capturado');
    publish('animal:registered', event.detail);
  });
  
  console.log('[WebhookService] Listeners de eventos inicializados');
};

/**
 * Notifica administradores sobre eventos importantes (exemplo de uso)
 */
export const setupAdminNotifications = (): () => void => {
  const unsubscribePartnership = subscribe('partnership:created', (data) => {
    console.log('[AdminNotification] Nova solicitação de parceria:', data);
    // Aqui você pode implementar notificações para administradores
    // Ex: Enviar email, criar notificação no sistema, etc.
  });
  
  const unsubscribeAdoption = subscribe('adoption:created', (data) => {
    console.log('[AdminNotification] Nova solicitação de adoção:', data);
    // Implementar notificação para administradores
  });
  
  // Retorna função para cancelar todas as assinaturas
  return () => {
    unsubscribePartnership();
    unsubscribeAdoption();
  };
};

// Exporta um objeto unified para facilitar o uso
export const webhookService = {
  subscribe,
  publish,
  initWebhookListeners,
  setupAdminNotifications
};

export default webhookService;
