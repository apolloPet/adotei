
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { User } from './types';

interface UserDetailedViewProps {
  users: User[];
  formatDate: (dateString: string) => string;
}

const UserDetailedView = ({ users, formatDate }: UserDetailedViewProps) => {
  if (users.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Nenhum usuário encontrado com os critérios de busca.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {users.map((user) => (
        <Card key={user.id} className="overflow-hidden">
          <div className="p-4 bg-muted/30">
            <div className="flex justify-between">
              <h3 className="text-lg font-medium">{user.name}</h3>
              <span className="text-sm text-muted-foreground">
                Cadastro: {formatDate(user.registrationDate)}
              </span>
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              {user.email} • {user.phone}
            </div>
          </div>
          <CardContent className="p-4 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium mb-2">Endereço</h4>
                <p className="text-sm">
                  {user.address.street}{user.address.number ? `, ${user.address.number}` : ''}<br />
                  {user.address.neighborhood ? `${user.address.neighborhood}, ` : ''}
                  {user.address.city}{user.address.state ? `, ${user.address.state}` : ''}<br />
                  CEP: {user.address.cep}
                </p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium mb-2">Moradia</h4>
                <p className="text-sm">
                  <span className="text-muted-foreground">Tipo:</span> {
                    user.housingType === 'apartment' ? 'Apartamento' : 
                    user.housingType === 'house' ? 'Casa' : 'Outro'
                  }<br />
                  <span className="text-muted-foreground">Crianças:</span> {
                    user.hasChildren ? `Sim${user.childrenAges ? ` (${user.childrenAges})` : ''}` : 'Não'
                  }
                </p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium mb-2">Experiência & Saúde</h4>
                <p className="text-sm">
                  <span className="text-muted-foreground">Já teve animais:</span> {
                    user.hadPetsBefore ? 'Sim' : 'Não'
                  }<br />
                  <span className="text-muted-foreground">Alergias:</span> {
                    user.hasAllergies ? `Sim${user.allergiesDescription ? ` (${user.allergiesDescription})` : ''}` : 'Não'
                  }
                </p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium mb-2">Rotina</h4>
                <p className="text-sm">
                  <span className="text-muted-foreground">Trabalho:</span> {user.workSchedule || 'Não informado'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default UserDetailedView;
