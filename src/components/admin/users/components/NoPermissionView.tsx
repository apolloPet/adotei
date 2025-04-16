
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ShieldAlert, UserCog } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export const NoPermissionView = () => {
  const [showDialog, setShowDialog] = useState(true);
  const navigate = useNavigate();

  return (
    <>
      <Card>
        <CardContent className="text-center py-8 text-muted-foreground flex flex-col items-center">
          <ShieldAlert className="h-8 w-8 mb-2 text-red-500" />
          <p>Você não possui permissão para visualizar usuários</p>
          <div className="mt-4 flex items-center gap-2 text-primary">
            <ShieldAlert className="h-5 w-5" />
            <span>Acesso restrito a administradores</span>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-red-500" />
              Acesso Restrito
            </DialogTitle>
            <DialogDescription>
              Você não possui permissão para visualizar usuários. Entre em contato com um administrador.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col items-center py-4">
            <UserCog className="h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-center mb-4">
              Para acessar a lista de usuários, você precisa ter permissões de administrador com acesso ao gerenciamento de usuários.
            </p>
          </div>
          
          <DialogFooter>
            <Button 
              variant="default" 
              onClick={() => window.location.reload()}
              className="w-full"
            >
              Tentar Novamente
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
