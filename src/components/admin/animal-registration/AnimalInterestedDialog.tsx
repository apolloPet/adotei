import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-sonner';
import {
  BackendAdoptionInterest,
  fetchAnimalInterests,
  interestTypeLabel,
} from '@/services/adoptionService';
import { formatDate } from '@/components/admin/adoption/types';
import { Animal } from '@/services/animalService';
import AdoptionDetailsPanel from '@/components/admin/adoption/AdoptionDetailsPanel';
import { AdoptionMatch } from '@/components/admin/adoption/types';

type AnimalInterestedDialogProps = {
  open: boolean;
  animal: Animal | null;
  onOpenChange: (open: boolean) => void;
};

const mapInterestToAdoptionMatch = (
  interest: BackendAdoptionInterest,
  animal: Animal
): AdoptionMatch => ({
  id: interest.id,
  petId: interest.animalId,
  petName: animal.nome,
  petImage: animal.fotoPrincipal || animal.fotos?.[0] || '/placeholder.svg',
  userId: interest.userId,
  userName: interest.userFullName,
  userEmail: interest.userEmail,
  userPhone: interest.userPhone || '',
  currentStage: interest.interestType === 'LIKED' ? 'interested' : 'pending_approval',
  createdAt: interest.createdAt,
  updatedAt: interest.updatedAt,
  matchPoints: [],
});

const AnimalInterestedDialog = ({ open, animal, onOpenChange }: AnimalInterestedDialogProps) => {
  const [interests, setInterests] = useState<BackendAdoptionInterest[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<AdoptionMatch | null>(null);

  useEffect(() => {
    if (!open || !animal) {
      return;
    }

    const load = async () => {
      setLoading(true);
      try {
        const data = await fetchAnimalInterests(animal.id);
        setInterests(data);
      } catch (error) {
        console.error('Erro ao carregar interessados:', error);
        toast.error('Não foi possível carregar os interessados deste animal.');
        setInterests([]);
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [open, animal]);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="flex max-h-[92vh] w-[min(96vw,80rem)] max-w-none flex-col gap-5 overflow-hidden p-6 sm:p-8">
          <DialogHeader className="space-y-2 pr-8">
            <DialogTitle className="text-xl">Interessados em {animal?.nome ?? 'animal'}</DialogTitle>
            <DialogDescription className="text-base leading-relaxed">
              Adotantes que demonstraram interesse ou salvaram este animal para acompanhar.
            </DialogDescription>
          </DialogHeader>

          {loading ? (
            <p className="py-6 text-base text-muted-foreground">Carregando interessados...</p>
          ) : interests.length === 0 ? (
            <p className="py-6 text-base text-muted-foreground">
              Nenhum interessado registrado para este animal ainda.
            </p>
          ) : (
            <div className="min-h-0 flex-1 overflow-auto rounded-md border">
              <Table className="min-w-[56rem] text-base">
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="min-w-[11rem] whitespace-nowrap px-5 py-4">Nome</TableHead>
                    <TableHead className="min-w-[16rem] px-5 py-4">E-mail</TableHead>
                    <TableHead className="min-w-[9rem] whitespace-nowrap px-5 py-4">Telefone</TableHead>
                    <TableHead className="min-w-[11rem] whitespace-nowrap px-5 py-4">Tipo</TableHead>
                    <TableHead className="min-w-[11rem] whitespace-nowrap px-5 py-4">Data</TableHead>
                    <TableHead className="min-w-[8rem] whitespace-nowrap px-5 py-4 text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {interests.map((interest) => (
                    <TableRow key={interest.id}>
                      <TableCell className="px-5 py-4 font-medium leading-snug">
                        {interest.userFullName}
                      </TableCell>
                      <TableCell className="px-5 py-4 leading-snug">
                        <span className="block max-w-[20rem] truncate" title={interest.userEmail}>
                          {interest.userEmail}
                        </span>
                      </TableCell>
                      <TableCell className="whitespace-nowrap px-5 py-4">
                        {interest.userPhone || '—'}
                      </TableCell>
                      <TableCell className="whitespace-nowrap px-5 py-4">
                        <Badge variant="secondary" className="px-3 py-1 text-sm font-normal">
                          {interestTypeLabel(interest.interestType)}
                        </Badge>
                      </TableCell>
                      <TableCell className="whitespace-nowrap px-5 py-4 text-muted-foreground">
                        {formatDate(interest.createdAt)}
                      </TableCell>
                      <TableCell className="whitespace-nowrap px-5 py-4 text-right">
                        {animal && (
                          <Button
                            variant="outline"
                            size="default"
                            className="shrink-0"
                            onClick={() =>
                              setSelectedMatch(mapInterestToAdoptionMatch(interest, animal))
                            }
                          >
                            Ver perfil
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {selectedMatch && (
        <Dialog open={Boolean(selectedMatch)} onOpenChange={() => setSelectedMatch(null)}>
          <DialogContent className="flex max-h-[92vh] w-[min(96vw,72rem)] max-w-none flex-col gap-5 overflow-y-auto p-6 sm:p-8">
            <DialogHeader>
              <DialogTitle>Perfil do interessado</DialogTitle>
              <DialogDescription>{selectedMatch.userName}</DialogDescription>
            </DialogHeader>
            <AdoptionDetailsPanel match={selectedMatch} />
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default AnimalInterestedDialog;
