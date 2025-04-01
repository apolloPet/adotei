
import React from 'react';

// Define all possible adoption stages
export type AdoptionStage = 
  | 'interested'          // User has shown interest
  | 'pending_approval'    // Admin is reviewing the request
  | 'approved'            // Request approved, next steps to be taken
  | 'visit_scheduled'     // Visit to meet the pet is scheduled
  | 'home_inspection'     // Home inspection scheduled/completed
  | 'completed'           // Adoption process completed successfully
  | 'rejected';           // Adoption request was rejected

// Stage descriptions
export const stageDescriptions = {
  interested: 'Você demonstrou interesse neste animal. Aguarde o contato da ONG para os próximos passos.',
  pending_approval: 'Sua solicitação está sendo analisada pela equipe. Você receberá um retorno em breve.',
  approved: 'Sua solicitação foi aprovada! A próxima etapa é agendar uma visita para conhecer o animal.',
  visit_scheduled: 'Visita agendada para conhecer o animal. Prepare-se para esse momento especial!',
  home_inspection: 'Uma visita à sua residência foi agendada para verificar o ambiente onde o animal viverá.',
  completed: 'Parabéns! O processo de adoção foi concluído com sucesso. O animal agora é oficialmente seu.',
  rejected: 'Infelizmente sua solicitação não foi aprovada neste momento. Verifique o motivo e tente novamente no futuro.'
};

// Stage ordering for progression
export const stageOrder: AdoptionStage[] = [
  'interested',
  'pending_approval',
  'approved',
  'visit_scheduled',
  'home_inspection',
  'completed'
];

// Get the next stage in the process
export const getNextStage = (currentStage: AdoptionStage): AdoptionStage | null => {
  const currentIndex = stageOrder.indexOf(currentStage);
  if (currentIndex === -1 || currentIndex === stageOrder.length - 1) {
    return null;
  }
  return stageOrder[currentIndex + 1];
};

// Determine if a stage is completed
export const isStageCompleted = (stage: AdoptionStage, currentStage: AdoptionStage): boolean => {
  const stageIndex = stageOrder.indexOf(stage);
  const currentIndex = stageOrder.indexOf(currentStage);
  return stageIndex < currentIndex;
};

// Determine if a stage is the current active stage
export const isCurrentStage = (stage: AdoptionStage, currentStage: AdoptionStage): boolean => {
  return stage === currentStage;
};

// Check if adoption is rejected
export const isRejected = (currentStage: AdoptionStage): boolean => {
  return currentStage === 'rejected';
};

// Timeline component to visualize adoption progress
export const AdoptionTimeline: React.FC<{ currentStage: AdoptionStage }> = ({ 
  currentStage 
}) => {
  // Render adoption process timeline based on current stage
  return (
    <div className="w-full">
      <div className="flex items-center justify-between w-full">
        {stageOrder.map((stage, index) => (
          <React.Fragment key={stage}>
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                isStageCompleted(stage, currentStage) ? 'bg-green-500 text-white' :
                isCurrentStage(stage, currentStage) ? 'bg-blue-500 text-white' : 
                'bg-gray-200 text-gray-500'
              }`}>
                {isStageCompleted(stage, currentStage) ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  index + 1
                )}
              </div>
              <span className="text-xs mt-1 text-center">{stage.split('_').join(' ')}</span>
            </div>
            
            {index < stageOrder.length - 1 && (
              <div className={`h-1 flex-1 ${
                isStageCompleted(stage, currentStage) ? 'bg-green-500' : 'bg-gray-200'
              }`} />
            )}
          </React.Fragment>
        ))}
      </div>
      
      {isRejected(currentStage) && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded text-red-600 text-sm">
          Sua solicitação de adoção foi rejeitada. Verifique os motivos e tente novamente no futuro.
        </div>
      )}
      
      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
        <h3 className="font-medium text-blue-800 mb-1">Estágio Atual: {currentStage.split('_').join(' ')}</h3>
        <p className="text-sm text-blue-600">{stageDescriptions[currentStage]}</p>
      </div>
    </div>
  );
};

export default AdoptionTimeline;
