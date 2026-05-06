import { z } from 'zod';

export const housingSchema = z
  .object({
    type: z.enum(['house', 'apartment', 'farm']),
    ownership: z.enum(['owned', 'rented']),
    rentAllowsPets: z.boolean().optional(),
    hasYard: z.boolean(),
    yardWalled: z.boolean().optional(),
    hasWindowScreens: z.boolean().optional(),
    numResidents: z.coerce.number().int().min(1, 'Informe ao menos 1'),
    hasChildren: z.boolean(),
    childrenAges: z.string().optional(),
  })
  .refine((d) => d.ownership !== 'rented' || typeof d.rentAllowsPets === 'boolean', {
    message: 'Informe se o aluguel permite animais',
    path: ['rentAllowsPets'],
  });

export const experienceSchema = z.object({
  hadPetsBefore: z.boolean(),
  currentlyHasPets: z.boolean(),
  currentPetsCount: z.coerce.number().int().min(0).optional(),
  currentPetsTypes: z.string().optional(),
  returnedAnimal: z.boolean(),
  petsVaccinated: z.boolean().optional(),
  petsNeutered: z.boolean().optional(),
});

export const financialSchema = z.object({
  awareOfCosts: z.boolean(),
  monthlyBudget: z.enum(['100-300', '300-600', '600+']),
  willCoverVaccines: z.boolean(),
  willCoverNeutering: z.boolean(),
  willCoverEmergencies: z.boolean(),
});

export const intentionSchema = z.object({
  reasonToAdopt: z
    .string()
    .trim()
    .min(1000, 'Descreva com no mínimo 1000 caracteres'),
  hoursAloneDaily: z.coerce.number().min(0).max(24),
  ifDestroyed: z.string().trim().min(10, 'Descreva sua atitude'),
  ifSick: z.string().trim().min(10, 'Descreva sua atitude'),
  willAdapt: z.boolean(),
});

export const proofSchema = z.object({
  environmentPhotoUrl: z.string().optional(),
  environmentVideoUrl: z.string().optional(),
});

export type HousingForm = z.infer<typeof housingSchema>;
export type ExperienceForm = z.infer<typeof experienceSchema>;
export type FinancialForm = z.infer<typeof financialSchema>;
export type IntentionForm = z.infer<typeof intentionSchema>;
export type ProofForm = z.infer<typeof proofSchema>;
