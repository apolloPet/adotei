import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { PlusCircle } from "lucide-react";
import { toast } from "@/hooks/use-sonner";
import { createAdminUser } from "@/services/adminUserService";
import type { NewAdminState, FormErrors } from "./types";

interface Props {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onSuccess: () => Promise<void>;
}

const INITIAL_PERMISSIONS = {
  manageAnimals: true,
  approveAdoptions: true,
  manageSettings: false,
  manageAdmins: false,
};

export const NewAdminDialog = ({ isOpen, setIsOpen, onSuccess }: Props) => {
  const [newAdmin, setNewAdmin] = useState<NewAdminState>({
    name: "",
    email: "",
    password: "",
    passwordConfirm: "",
    permissions: INITIAL_PERMISSIONS,
  });
  const [formErrors, setFormErrors] = useState<FormErrors>({
    name: "",
    email: "",
    password: "",
    passwordConfirm: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewAdmin((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handlePermissionChange = (permission: keyof NewAdminState["permissions"]) => {
    setNewAdmin((prev) => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [permission]: !prev.permissions[permission],
      },
    }));
  };

  const validateForm = (): boolean => {
    let isValid = true;
    const errors: FormErrors = { name: "", email: "", password: "", passwordConfirm: "" };

    if (!newAdmin.name.trim()) {
      errors.name = "Nome é obrigatório";
      isValid = false;
    }
    if (!newAdmin.email.trim()) {
      errors.email = "Email é obrigatório";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(newAdmin.email)) {
      errors.email = "Email inválido";
      isValid = false;
    }
    if (!newAdmin.password) {
      errors.password = "Senha é obrigatória";
      isValid = false;
    } else if (newAdmin.password.length < 6) {
      errors.password = "Senha deve ter pelo menos 6 caracteres";
      isValid = false;
    }
    if (newAdmin.password !== newAdmin.passwordConfirm) {
      errors.passwordConfirm = "As senhas não coincidem";
      isValid = false;
    }
    setFormErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      // Debug info to verify data being sent
      console.log('Submitting admin creation with data:', {
        email: newAdmin.email,
        name: newAdmin.name,
        passwordLength: newAdmin.password.length,
        permissions: newAdmin.permissions
      });

      const result = await createAdminUser(
        newAdmin.email,
        newAdmin.password,
        newAdmin.name,
        newAdmin.permissions
      );

      if (result.success) {
        toast.success(result.message);
        setIsOpen(false);
        await onSuccess();
        setNewAdmin({
          name: "",
          email: "",
          password: "",
          passwordConfirm: "",
          permissions: INITIAL_PERMISSIONS,
        });
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error("Erro ao criar administrador:", error);
      toast.error("Erro ao criar administrador");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <PlusCircle className="h-4 w-4" />
          Novo Administrador
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Adicionar Novo Administrador</DialogTitle>
          <DialogDescription>
            Preencha os dados para criar uma conta com privilégios administrativos.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome Completo</Label>
            <Input
              id="name"
              name="name"
              value={newAdmin.name}
              onChange={handleInputChange}
              placeholder="Nome do administrador"
            />
            {formErrors.name && <p className="text-sm text-red-500">{formErrors.name}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={newAdmin.email}
              onChange={handleInputChange}
              placeholder="email@exemplo.com"
            />
            {formErrors.email && <p className="text-sm text-red-500">{formErrors.email}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              name="password"
              type="password"
              value={newAdmin.password}
              onChange={handleInputChange}
              placeholder="••••••••"
            />
            {formErrors.password && <p className="text-sm text-red-500">{formErrors.password}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="passwordConfirm">Confirmar Senha</Label>
            <Input
              id="passwordConfirm"
              name="passwordConfirm"
              type="password"
              value={newAdmin.passwordConfirm}
              onChange={handleInputChange}
              placeholder="••••••••"
            />
            {formErrors.passwordConfirm && (
              <p className="text-sm text-red-500">{formErrors.passwordConfirm}</p>
            )}
          </div>
          <div className="space-y-3 pt-2">
            <Label>Permissões</Label>
            <div className="flex items-center justify-between">
              <Label htmlFor="manage-animals" className="cursor-pointer">
                Gerenciar Animais
              </Label>
              <Switch
                id="manage-animals"
                checked={newAdmin.permissions.manageAnimals}
                onCheckedChange={() => handlePermissionChange("manageAnimals")}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="approve-adoptions" className="cursor-pointer">
                Aprovar Adoções
              </Label>
              <Switch
                id="approve-adoptions"
                checked={newAdmin.permissions.approveAdoptions}
                onCheckedChange={() => handlePermissionChange("approveAdoptions")}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="manage-settings" className="cursor-pointer">
                Configurar Parâmetros
              </Label>
              <Switch
                id="manage-settings"
                checked={newAdmin.permissions.manageSettings}
                onCheckedChange={() => handlePermissionChange("manageSettings")}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="manage-admins" className="cursor-pointer">
                Gerenciar Administradores
              </Label>
              <Switch
                id="manage-admins"
                checked={newAdmin.permissions.manageAdmins}
                onCheckedChange={() => handlePermissionChange("manageAdmins")}
              />
            </div>
          </div>
          <DialogFooter className="pt-4">
            <Button type="submit" className="w-full md:w-auto" disabled={isLoading}>
              {isLoading ? "Criando..." : "Criar Administrador"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
