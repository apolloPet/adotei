import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from '@/hooks/use-sonner';
import { updateUser } from '@/services/userService';
import { isValidEmail, isValidPhoneBR, maskCEP, maskPhoneBR, normalizeEmail } from '@/utils/brMasks';
import { User } from './types';

interface UserEditDialogProps {
  user: User | null;
  onClose: () => void;
  onSaved: () => void;
}

const toFormState = (user: User | null) => ({
  name: user?.name ?? '',
  email: user?.email ?? '',
  phone: user?.phone ?? '',
  cep: user?.address?.cep ?? '',
  street: user?.address?.street ?? '',
  number: user?.address?.number ?? '',
  neighborhood: user?.address?.neighborhood ?? '',
  city: user?.address?.city ?? '',
  state: user?.address?.state ?? '',
});

export const UserEditDialog = ({ user, onClose, onSaved }: UserEditDialogProps) => {
  const [form, setForm] = useState(toFormState(user));
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setForm(toFormState(user));
  }, [user]);

  const setField = (field: keyof ReturnType<typeof toFormState>, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSave = async () => {
    if (!user) {
      return;
    }
    if (!form.name.trim()) {
      toast.error('Informe o nome do usuário');
      return;
    }
    if (!isValidEmail(form.email)) {
      toast.error('Email inválido');
      return;
    }
    if (form.phone && !isValidPhoneBR(form.phone)) {
      toast.error('Telefone inválido');
      return;
    }

    setIsSaving(true);
    try {
      const updated = await updateUser(user.id, {
        name: form.name.trim(),
        email: normalizeEmail(form.email),
        phone: form.phone.trim(),
        address: {
          cep: form.cep,
          street: form.street,
          number: form.number,
          neighborhood: form.neighborhood,
          city: form.city,
          state: form.state,
        },
      });

      if (!updated) {
        toast.error('Erro ao salvar usuário');
        return;
      }

      toast.success('Usuário atualizado com sucesso');
      onSaved();
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={Boolean(user)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg w-[95vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar usuário</DialogTitle>
          <DialogDescription>Atualize os dados cadastrais do usuário.</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 py-2">
          <div className="space-y-1 sm:col-span-2">
            <Label htmlFor="edit-user-name">Nome</Label>
            <Input id="edit-user-name" value={form.name} onChange={(e) => setField('name', e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="edit-user-email">Email</Label>
            <Input
              id="edit-user-email"
              type="email"
              value={form.email}
              onChange={(e) => setField('email', normalizeEmail(e.target.value))}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="edit-user-phone">Telefone</Label>
            <Input
              id="edit-user-phone"
              value={form.phone}
              onChange={(e) => setField('phone', maskPhoneBR(e.target.value))}
              placeholder="(11) 99999-9999"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="edit-user-cep">CEP</Label>
            <Input id="edit-user-cep" value={form.cep} onChange={(e) => setField('cep', maskCEP(e.target.value))} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="edit-user-street">Rua</Label>
            <Input id="edit-user-street" value={form.street} onChange={(e) => setField('street', e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="edit-user-number">Número</Label>
            <Input id="edit-user-number" value={form.number} onChange={(e) => setField('number', e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="edit-user-neighborhood">Bairro</Label>
            <Input
              id="edit-user-neighborhood"
              value={form.neighborhood}
              onChange={(e) => setField('neighborhood', e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="edit-user-city">Cidade</Label>
            <Input id="edit-user-city" value={form.city} onChange={(e) => setField('city', e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="edit-user-state">UF</Label>
            <Input
              id="edit-user-state"
              value={form.state}
              onChange={(e) => setField('state', e.target.value.toUpperCase().slice(0, 2))}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Salvando...' : 'Salvar alterações'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UserEditDialog;
