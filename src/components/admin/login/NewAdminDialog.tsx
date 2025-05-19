
import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-sonner";
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";

const NewAdminDialog = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [newAdmin, setNewAdmin] = useState({
    email: '',
    password: '',
    name: ''
  });
  
  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newAdmin.email || !newAdmin.password || !newAdmin.name) {
      toast.error("Preencha todos os campos para criar o administrador");
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Registrar novo usuário
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: newAdmin.email,
        password: newAdmin.password,
        options: {
          data: {
            name: newAdmin.name,
            isAdmin: true
          }
        }
      });
      
      if (authError) {
        console.error('Erro ao criar usuário:', authError);
        toast.error(`Erro ao criar usuário: ${authError.message}`);
        return;
      }
      
      if (!authData.user) {
        toast.error("Erro ao criar usuário");
        return;
      }
      
      // Atribuir papel de admin
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: authData.user.id,
          role: 'admin',
          permissions: {
            manageAnimals: true,
            approveAdoptions: true,
            manageSettings: true,
            manageAdmins: true
          }
        });
      
      if (roleError) {
        console.error('Erro ao atribuir papel de admin:', roleError);
        toast.error(`Erro ao atribuir papel de administrador: ${roleError.message}`);
      } else {
        toast.success("Administrador criado com sucesso!");
        toast.info(`Email: ${newAdmin.email}, Senha: ${newAdmin.password}`);
        
        setNewAdmin({
          email: '',
          password: '',
          name: ''
        });
      }
    } catch (error) {
      console.error("Erro ao criar administrador:", error);
      toast.error("Erro ao processar criação de administrador");
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Criar Novo Administrador</DialogTitle>
        <DialogDescription>
          Preencha os dados para criar uma nova conta administrativa com acesso total.
        </DialogDescription>
      </DialogHeader>
      
      <form onSubmit={handleCreateAdmin} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="new-admin-name">Nome</Label>
          <Input 
            id="new-admin-name" 
            placeholder="Nome do administrador" 
            value={newAdmin.name}
            onChange={(e) => setNewAdmin({...newAdmin, name: e.target.value})}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="new-admin-email">Email</Label>
          <Input 
            id="new-admin-email" 
            type="email" 
            placeholder="novo.admin@exemplo.com" 
            value={newAdmin.email}
            onChange={(e) => setNewAdmin({...newAdmin, email: e.target.value})}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="new-admin-password">Senha</Label>
          <Input 
            id="new-admin-password" 
            type="password" 
            placeholder="••••••••" 
            value={newAdmin.password}
            onChange={(e) => setNewAdmin({...newAdmin, password: e.target.value})}
            required
          />
        </div>
        
        <DialogFooter>
          <Button 
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? "Criando..." : "Criar Administrador"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
};

export default NewAdminDialog;
