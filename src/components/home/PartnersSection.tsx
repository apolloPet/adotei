
import { motion } from 'framer-motion';
import { Award, Star, Shield } from 'lucide-react';

interface PartnersSectionProps {
  isVisible: boolean;
}

const PartnersSection = ({ isVisible }: PartnersSectionProps) => {
  // Array of partner logos with their names and URLs
  const partners = [
    {
      name: "Royal Canin",
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/96/Royal-Canin-Logo.svg/2560px-Royal-Canin-Logo.svg.png",
      url: "https://www.royalcanin.com/"
    },
    {
      name: "PetLove",
      logo: "https://www.petlove.com.br/static/uploads/2019/07/cropped-logo-2.png",
      url: "https://www.petlove.com.br/"
    },
    {
      name: "Petz",
      logo: "https://logodownload.org/wp-content/uploads/2018/05/petz-logo.png",
      url: "https://www.petz.com.br/"
    },
    {
      name: "Cobasi",
      logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQD7PRnyuSBtJbx5PRTGytCxl8s35hhLNHgSA&usqp=CAU",
      url: "https://www.cobasi.com.br/"
    },
  ];

  return (
    <section id="partners" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ 
            opacity: isVisible ? 1 : 0, 
            y: isVisible ? 0 : 20 
          }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 text-primary mb-4">
              <Award className="h-6 w-6" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              Nossos Parceiros
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Contamos com o apoio de empresas que compartilham nossa missão de cuidar e proteger os animais.
            </p>
          </div>
          
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 mb-12">
            {partners.map((partner, index) => (
              <a 
                key={index} 
                href={partner.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-32 md:w-40 h-auto grayscale hover:grayscale-0 transition-all duration-300"
              >
                <img 
                  src={partner.logo} 
                  alt={partner.name} 
                  className="w-full h-auto object-contain"
                />
              </a>
            ))}
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div className="bg-card rounded-xl p-6 shadow-sm">
              <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 text-primary mb-4">
                <Star className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-xl mb-2">Produtos Premium</h3>
              <p className="text-muted-foreground">
                Acesso a descontos exclusivos em produtos de alta qualidade para seu pet.
              </p>
            </div>
            
            <div className="bg-card rounded-xl p-6 shadow-sm">
              <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 text-primary mb-4">
                <Shield className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-xl mb-2">Cuidados Veterinários</h3>
              <p className="text-muted-foreground">
                Parcerias com clínicas veterinárias para garantir o bem-estar do seu animal.
              </p>
            </div>
            
            <div className="bg-card rounded-xl p-6 shadow-sm">
              <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 text-primary mb-4">
                <Award className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-xl mb-2">Treinamento</h3>
              <p className="text-muted-foreground">
                Acesso a cursos e materiais educativos sobre cuidados e treinamento animal.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default PartnersSection;
