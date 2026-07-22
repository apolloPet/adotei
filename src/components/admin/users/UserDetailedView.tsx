import { Card, CardContent } from '@/components/ui/card';
import { User } from './types';

interface UserDetailedViewProps {
  users: User[];
  formatDate: (dateString: string) => string;
}

const yesNo = (value?: boolean) => value === undefined ? 'Não informado' : value ? 'Sim' : 'Não';

const housingTypeLabel = (value?: string) => ({
  apartment: 'Apartamento',
  house: 'Casa',
  farm: 'Chácara/sítio',
  other: 'Outro',
}[value ?? ''] ?? 'Não informado');

const ownershipLabel = (value?: string) => ({ owned: 'Própria', rented: 'Alugada' }[value ?? ''] ?? 'Não informado');

const budgetLabel = (value?: string) => ({
  '100-300': 'R$ 100 a R$ 300',
  '300-600': 'R$ 300 a R$ 600',
  '600+': 'Acima de R$ 600',
}[value ?? ''] ?? 'Não informado');

const Detail = ({ label, value }: { label: string; value: string | number }) => (
  <p className="text-sm"><span className="text-muted-foreground">{label}:</span> {value}</p>
);

const UserDetailedView = ({ users, formatDate }: UserDetailedViewProps) => {
  if (users.length === 0) {
    return <div className="py-8 text-center text-muted-foreground">Nenhum usuário encontrado com os critérios de busca.</div>;
  }

  return (
    <div className="space-y-4">
      {users.map((user) => {
        const profile = user.adopterProfile;
        return (
          <Card key={user.id} className="overflow-hidden">
            <div className="bg-muted/30 p-4">
              <div className="flex flex-col justify-between gap-1 sm:flex-row">
                <h3 className="text-lg font-medium">{user.name}</h3>
                <span className="text-sm text-muted-foreground">Cadastro: {formatDate(user.registrationDate)}</span>
              </div>
              <div className="mt-1 text-sm text-muted-foreground">{user.email} {user.phone ? `• ${user.phone}` : ''}</div>
            </div>
            <CardContent className="p-4 pt-4">
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                <section>
                  <h4 className="mb-2 text-sm font-medium">Endereço</h4>
                  <p className="text-sm">
                    {user.address?.street || 'Não informado'}{user.address?.number ? `, ${user.address.number}` : ''}<br />
                    {user.address?.neighborhood ? `${user.address.neighborhood}, ` : ''}{user.address?.city || 'Não informado'}{user.address?.state ? `, ${user.address.state}` : ''}<br />
                    CEP: {user.address?.cep || 'Não informado'}
                  </p>
                </section>

                {profile ? <>
                  <section>
                    <h4 className="mb-2 text-sm font-medium">Moradia</h4>
                    <Detail label="Tipo" value={housingTypeLabel(profile.housingType)} />
                    <Detail label="Situação" value={ownershipLabel(profile.ownershipType)} />
                    <Detail label="Aluguel permite pets" value={yesNo(profile.rentAllowsPets)} />
                    <Detail label="Quintal" value={yesNo(profile.hasYard)} />
                    <Detail label="Quintal murado" value={yesNo(profile.yardWalled)} />
                    <Detail label="Telas nas janelas" value={yesNo(profile.hasWindowScreens)} />
                    <Detail label="Moradores" value={profile.residentsCount ?? 'Não informado'} />
                    <Detail label="Crianças" value={profile.hasChildren ? `Sim${profile.childrenAges ? ` (${profile.childrenAges})` : ''}` : yesNo(profile.hasChildren)} />
                  </section>

                  <section>
                    <h4 className="mb-2 text-sm font-medium">Experiência com animais</h4>
                    <Detail label="Já teve animais" value={yesNo(profile.hadPetsBefore)} />
                    <Detail label="Possui animais hoje" value={yesNo(profile.currentlyHasPets)} />
                    <Detail label="Quantidade atual" value={profile.currentPetsCount ?? 'Não informado'} />
                    <Detail label="Tipos atuais" value={profile.currentPetsTypes || 'Não informado'} />
                    <Detail label="Já devolveu animal" value={yesNo(profile.returnedAnimal)} />
                    <Detail label="Animais vacinados" value={yesNo(profile.petsVaccinated)} />
                    <Detail label="Animais castrados" value={yesNo(profile.petsNeutered)} />
                  </section>

                  <section>
                    <h4 className="mb-2 text-sm font-medium">Financeiro</h4>
                    <Detail label="Conhece os custos" value={yesNo(profile.awareOfCosts)} />
                    <Detail label="Orçamento mensal" value={budgetLabel(profile.monthlyBudget)} />
                    <Detail label="Cobre vacinas" value={yesNo(profile.willCoverVaccines)} />
                    <Detail label="Cobre castração" value={yesNo(profile.willCoverNeutering)} />
                    <Detail label="Cobre emergências" value={yesNo(profile.willCoverEmergencies)} />
                  </section>

                  <section>
                    <h4 className="mb-2 text-sm font-medium">Rotina e intenção</h4>
                    <Detail label="Horas sozinho/dia" value={profile.hoursAloneDaily ?? 'Não informado'} />
                    <Detail label="Vai se adaptar" value={yesNo(profile.willAdapt)} />
                    <Detail label="Motivo para adotar" value={profile.reasonToAdopt || 'Não informado'} />
                    <Detail label="Se destruir algo" value={profile.ifDestroyed || 'Não informado'} />
                    <Detail label="Se ficar doente" value={profile.ifSick || 'Não informado'} />
                  </section>
                </> : (
                  <section className="md:col-span-2 xl:col-span-2">
                    <h4 className="mb-2 text-sm font-medium">Perfil de adoção</h4>
                    <p className="text-sm text-muted-foreground">Este usuário ainda não preencheu informações de moradia, experiência, financeiro e rotina.</p>
                  </section>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default UserDetailedView;
