
import { AnimalFormData } from "./types";

export interface AnimalLocationStaffProps {
  formData: AnimalFormData;
  onFormChange: (updates: Partial<AnimalFormData>) => void;
}

const AnimalLocationStaff = (_props: AnimalLocationStaffProps) => null;

export default AnimalLocationStaff;
