
/**
 * Utility functions to send WhatsApp messages to users
 */

/**
 * Opens WhatsApp with a pre-filled message to the given phone number
 * @param phoneNumber - The phone number to send the message to (without special characters)
 * @param message - The message to send
 */
export const sendWhatsAppMessage = (phoneNumber: string, message: string) => {
  // Clean the phone number (remove any non-numeric characters)
  const cleanPhone = phoneNumber.replace(/\D/g, '');
  
  // Format the message for URL encoding
  const encodedMessage = encodeURIComponent(message);
  
  // Create the WhatsApp API URL
  const whatsappUrl = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodedMessage}`;
  
  // Open WhatsApp in a new window
  window.open(whatsappUrl, '_blank');
};

/**
 * Generates a message based on the adoption stage
 * @param petName - The name of the pet
 * @param stage - The current adoption stage
 * @returns A formatted message appropriate for the stage
 */
export const generateAdoptionStageMessage = (petName: string, stage: string): string => {
  switch (stage) {
    case "interested":
      return `Olá! Recebemos seu interesse na adoção de ${petName}! Em breve nossa equipe analisará seu perfil e entrará em contato. Obrigado pelo interesse!`;
    
    case "pending_approval":
      return `Olá! Seu perfil para adoção de ${petName} está em análise. Estamos verificando as informações e em breve teremos uma resposta para você. Obrigado pela paciência!`;
    
    case "approved":
      return `Ótimas notícias! Seu perfil para adoção de ${petName} foi APROVADO! 🎉 O próximo passo é agendar uma visita para conhecer o pet pessoalmente. Aguarde nosso contato para mais detalhes.`;
    
    case "visit_scheduled":
      return `Sua visita para conhecer ${petName} está agendada! Não esqueça de comparecer no dia e horário marcados. Estamos ansiosos para este encontro!`;
    
    case "home_inspection":
      return `Olá! Agendamos uma visita à sua residência para verificar o ambiente onde ${petName} irá morar. Esta é uma das últimas etapas antes da conclusão da adoção. Obrigado pela compreensão!`;
    
    case "completed":
      return `PARABÉNS! 🎉 A adoção de ${petName} foi concluída com sucesso! Desejamos muita felicidade nessa nova jornada. Lembre-se que estaremos sempre à disposição para ajudar no que for preciso.`;
    
    default:
      return `Olá! Há uma atualização sobre o processo de adoção de ${petName}. Entre em contato conosco para mais informações.`;
  }
};
