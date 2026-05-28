import { z } from 'zod';

/** Zod rejeita `null` em campos opcionais; o backend pode devolver null. */
const bool = (defaultValue = false) =>
  z.preprocess((value) => (value === null || value === undefined ? defaultValue : value), z.boolean());

const boolOptional = () =>
  z.preprocess((value) => (value === null ? undefined : value), z.boolean().optional());

const stringOptional = () =>
  z.preprocess((value) => (value === null ? undefined : value), z.string().optional());

export const housingSchema = z.object({
  type: z.enum(['house', 'apartment', 'farm']),
  ownership: z.enum(['owned', 'rented']),
  // Campos booleanos da UI devem sempre ter fallback explícito para evitar bloqueio de submit.
  rentAllowsPets: bool(false),
  hasYard: bool(false),
  yardWalled: bool(false),
  hasWindowScreens: bool(false),
  numResidents: z.coerce.number().int().min(1, 'Informe ao menos 1'),
  hasChildren: bool(false),
  childrenAges: stringOptional(),
});

export const experienceSchema = z.object({
  hadPetsBefore: bool(false),
  currentlyHasPets: bool(false),
  currentPetsCount: z.coerce.number().int().min(0).optional(),
  currentPetsTypes: stringOptional(),
  returnedAnimal: bool(false),
  petsVaccinated: boolOptional(),
  petsNeutered: boolOptional(),
});

export const financialSchema = z.object({
  awareOfCosts: bool(false),
  monthlyBudget: z.enum(['100-300', '300-600', '600+']),
  willCoverVaccines: bool(false),
  willCoverNeutering: bool(false),
  willCoverEmergencies: bool(false),
});

export const intentionSchema = z.object({
  reasonToAdopt: z
    .string()
    .trim()
    .max(1000, 'Use no máximo 1000 caracteres'),
  hoursAloneDaily: z.coerce.number().min(0).max(24),
  ifDestroyed: z.string().trim().min(10, 'Descreva sua atitude'),
  ifSick: z.string().trim().min(10, 'Descreva sua atitude'),
  willAdapt: bool(true),
});

export const proofSchema = z.object({
  environmentPhotoUrl: stringOptional(),
});

export type HousingForm = z.infer<typeof housingSchema>;
export type ExperienceForm = z.infer<typeof experienceSchema>;
export type FinancialForm = z.infer<typeof financialSchema>;
export type IntentionForm = z.infer<typeof intentionSchema>;
export type ProofForm = z.infer<typeof proofSchema>;
