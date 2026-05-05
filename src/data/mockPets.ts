import { Pet } from "@/types/pets";

const dogImages = [
  "https://images.unsplash.com/photo-1517849845537-4d257902454a?w=800",
  "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=800",
  "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=800",
  "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800",
  "https://images.unsplash.com/photo-1561037404-61cd46aa615b?w=800",
];

const catImages = [
  "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=800",
  "https://images.unsplash.com/photo-1574158622682-e40e69881006?w=800",
  "https://images.unsplash.com/photo-1592194996308-7b43878e84a6?w=800",
  "https://images.unsplash.com/photo-1495360010541-f48722b34f7d?w=800",
  "https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=800",
];

const dogNames = ["Thor", "Luna", "Bidu", "Mel", "Rex", "Nina", "Toby", "Amora", "Bento", "Lola"];
const catNames = ["Mia", "Simba", "Frida", "Oliver", "Nala", "Tom", "Lola", "Felix"];
const breeds = {
  dog: ["SRD", "Labrador", "Golden Retriever", "Poodle", "Pinscher", "Vira-lata Caramelo"],
  cat: ["SRD", "Siamês", "Persa", "Angorá", "Maine Coon"],
  other: ["Coelho", "Hamster"],
};
const cities = ["São Paulo, SP", "Rio de Janeiro, RJ", "Belo Horizonte, MG", "Curitiba, PR", "Porto Alegre, RS"];
const shelters = ["ONG Patinhas Felizes", "Abrigo Amigo Fiel", "Casa dos Bichos", "Lar Pet Esperança"];
const traitsPool = ["Brincalhão", "Carinhoso", "Calmo", "Sociável", "Protetor", "Independente", "Curioso", "Tímido"];

const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];
const pickMany = <T,>(arr: T[], n: number) =>
  [...arr].sort(() => Math.random() - 0.5).slice(0, n);

const sizes: Pet["size"][] = ["small", "medium", "large"];
const genders: Pet["gender"][] = ["male", "female"];
const speciesList: Pet["species"][] = ["dog", "cat", "other"];

export const generateMockPets = (count = 12): Pet[] => {
  return Array.from({ length: count }).map((_, i) => {
    const species = pick(speciesList);
    const isDog = species === "dog";
    const isCat = species === "cat";
    const images = isDog
      ? pickMany(dogImages, 3)
      : isCat
      ? pickMany(catImages, 3)
      : pickMany([...dogImages, ...catImages], 3);
    const name = isDog ? pick(dogNames) : isCat ? pick(catNames) : pick([...dogNames, ...catNames]);
    return {
      id: `mock-${i}-${Math.random().toString(36).slice(2, 8)}`,
      name,
      breed: pick(breeds[species]),
      gender: pick(genders),
      size: pick(sizes),
      species,
      age: String(1 + Math.floor(Math.random() * 12)),
      weight: 2 + Math.floor(Math.random() * 30),
      shelterTime: `${1 + Math.floor(Math.random() * 24)} meses`,
      medicalInfo: "Vacinado e castrado",
      description:
        "Um companheiro adorável esperando por uma família amorosa. Super dócil, brincalhão e cheio de energia para compartilhar.",
      location: pick(cities),
      images,
      primaryImage: images[0],
      specialNeeds: Math.random() > 0.85,
      healthIssues: Math.random() > 0.9,
      shelter: pick(shelters),
      traits: pickMany(traitsPool, 3),
    };
  });
};
