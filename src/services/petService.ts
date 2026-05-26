import { createAnimal, deleteAnimal, getAnimalById, getAnimals, updateAnimal } from '@/services/animalService';
import { Pet } from '@/types/pets';
import { animalToPet } from '@/utils/animalAdapter';

export interface PetFilters {
  species?: 'dog' | 'cat' | 'other' | 'all';
  gender?: 'male' | 'female' | 'all';
  size?: 'small' | 'medium' | 'large' | 'all';
  ageRange?: [number, number];
  hasSpecialNeeds?: boolean;
  hasHealthIssues?: boolean;
  searchTerm?: string;
}

export const fetchPets = async (filters?: PetFilters): Promise<Pet[]> => {
  try {
    const animals = await getAnimals();
    let pets = animals.map(animalToPet);

    if (filters?.species && filters.species !== 'all') {
      pets = pets.filter((pet) => pet.species === filters.species);
    }
    if (filters?.gender && filters.gender !== 'all') {
      pets = pets.filter((pet) => pet.gender === filters.gender);
    }
    if (filters?.size && filters.size !== 'all') {
      pets = pets.filter((pet) => pet.size === filters.size);
    }
    if (filters?.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      pets = pets.filter((pet) =>
        pet.name.toLowerCase().includes(term) ||
        pet.breed.toLowerCase().includes(term) ||
        pet.description.toLowerCase().includes(term),
      );
    }

    return pets;
  } catch (error) {
    console.error('Error fetching pets:', error);
    return [];
  }
};

export const fetchPetById = async (id: string): Promise<Pet | null> => {
  try {
    const animal = await getAnimalById(id);
    return animal ? animalToPet(animal) : null;
  } catch (error) {
    console.error('Error fetching pet by ID:', error);
    return null;
  }
};

export const getFeaturedPets = async (limit: number = 6): Promise<Pet[]> => {
  try {
    const pets = await fetchPets();
    return pets.slice(0, limit);
  } catch (error) {
    console.error('Error fetching featured pets:', error);
    return [];
  }
};

export const createPet = async (pet: Omit<Pet, 'id'>, images: File[]): Promise<Pet | null> => {
  try {
    const created = await createAnimal({
      nome: pet.name,
      idade: parseInt(pet.age, 10) || 0,
      tipo: pet.species === 'cat' ? 'gato' : 'cachorro',
      porte: pet.size === 'small' ? 'pequeno' : pet.size === 'medium' ? 'medio' : 'grande',
      sexo: pet.gender === 'male' ? 'macho' : 'femea',
      castrado: !!pet.neutered,
      vacinas: pet.vaccinated ? ['complete'] : ['none'],
      descricao: pet.description,
      fotos: images.length ? [URL.createObjectURL(images[0])] : pet.images,
      fotoPrincipal: pet.primaryImage,
    });

    return created ? animalToPet(created) : null;
  } catch (error) {
    console.error('Error creating pet:', error);
    return null;
  }
};

export const updatePet = async (id: string, updates: Partial<Pet>, newImages?: File[]): Promise<Pet | null> => {
  try {
    const updated = await updateAnimal(id, {
      nome: updates.name,
      idade: updates.age ? parseInt(updates.age, 10) : undefined,
      tipo: updates.species ? (updates.species === 'cat' ? 'gato' : 'cachorro') : undefined,
      porte: updates.size ? (updates.size === 'small' ? 'pequeno' : updates.size === 'medium' ? 'medio' : 'grande') : undefined,
      sexo: updates.gender ? (updates.gender === 'male' ? 'macho' : 'femea') : undefined,
      descricao: updates.description,
      castrado: updates.neutered,
      vacinas: updates.vaccinated === undefined ? undefined : updates.vaccinated ? ['complete'] : ['none'],
      fotoPrincipal: newImages?.[0] ? URL.createObjectURL(newImages[0]) : updates.primaryImage,
    });
    return updated ? animalToPet(updated) : null;
  } catch (error) {
    console.error('Error updating pet:', error);
    return null;
  }
};

export const deletePet = async (id: string): Promise<boolean> => {
  try {
    return deleteAnimal(id);
  } catch (error) {
    console.error('Error deleting pet:', error);
    return false;
  }
};
