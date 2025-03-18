
// Este componente está sendo substituído por src/components/Login.tsx
// para evitar duplicação de lógica e reduzir o número de rotas

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from "@/hooks/use-sonner";

const LoginForm = () => {
  const navigate = useNavigate();
  
  // Redirecionar para a página de login unificada
  useEffect(() => {
    console.log('LoginForm: Redirecionando para o componente de login unificado');
    toast.info('Por favor, faça login para continuar');
    navigate('/login', { replace: true });
  }, [navigate]);
  
  return null; // Não renderizar nada, apenas redirecionar
};

export default LoginForm;
