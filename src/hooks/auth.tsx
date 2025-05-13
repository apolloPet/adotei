
// Este arquivo será usado para exportar tudo do novo módulo auth para manter compatibilidade
// com o código existente

import { 
  AuthProvider,
  useAuth,
  useAuthState,
  useAuthSubscription,
  useAuditLog
} from './auth/index';

export {
  AuthProvider,
  useAuth,
  useAuthState,
  useAuthSubscription,
  useAuditLog
};
