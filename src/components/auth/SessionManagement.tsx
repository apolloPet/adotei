
import { useState, useEffect } from 'react';
import { getUserSessions, terminateSession, UserSession } from '@/services/auth';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { LogOut, RefreshCw, Monitor, Smartphone, Laptop } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { pt } from 'date-fns/locale';
import { toast } from '@/hooks/use-sonner';

const SessionManagement = () => {
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const fetchSessions = async () => {
    setIsLoading(true);
    try {
      const userSessions = await getUserSessions();
      setSessions(userSessions);
    } catch (error) {
      console.error('Error fetching sessions:', error);
      toast.error('Não foi possível carregar suas sessões ativas');
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchSessions();
  }, []);
  
  const handleTerminateSession = async (sessionId: string) => {
    try {
      const success = await terminateSession(sessionId);
      
      if (success) {
        // Se a sessão atual foi encerrada, o usuário já será redirecionado
        // para a página de login pelo processo de logout
        // Caso contrário, atualizar a lista de sessões
        if (!sessions.find(s => s.id === sessionId)?.isCurrentSession) {
          toast.success('Sessão encerrada com sucesso');
          // Atualizar a lista de sessões
          setSessions(sessions.filter(s => s.id !== sessionId));
        }
      } else {
        toast.error('Não foi possível encerrar a sessão');
      }
    } catch (error) {
      console.error('Error terminating session:', error);
      toast.error('Não foi possível encerrar a sessão');
    }
  };
  
  const getDeviceIcon = (device: string) => {
    if (device.includes('Android') || device.includes('iOS') || device.includes('iPhone') || device.includes('Móvel')) {
      return <Smartphone className="h-4 w-4" />;
    } else if (device.includes('Mac') || device.includes('Windows') || device.includes('Linux') || device.includes('PC')) {
      return <Laptop className="h-4 w-4" />;
    } else {
      return <Monitor className="h-4 w-4" />;
    }
  };
  
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd 'de' MMMM 'de' yyyy, HH:mm", { locale: pt });
    } catch (error) {
      return 'Data desconhecida';
    }
  };
  
  const getRelativeTime = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true, locale: pt });
    } catch (error) {
      return 'Tempo desconhecido';
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Sessões Ativas</CardTitle>
            <CardDescription>Gerenciar suas sessões em todos os dispositivos</CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={fetchSessions} 
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {sessions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {isLoading ? 'Carregando sessões...' : 'Nenhuma sessão ativa encontrada'}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Dispositivo</TableHead>
                <TableHead>Navegador</TableHead>
                <TableHead>Último acesso</TableHead>
                <TableHead>Iniciada em</TableHead>
                <TableHead className="text-right">Ação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sessions.map((session) => (
                <TableRow key={session.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getDeviceIcon(session.device)}
                      <span>{session.device}</span>
                      {session.isCurrentSession && (
                        <Badge variant="outline" className="ml-2">
                          Atual
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{session.browser}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{getRelativeTime(session.lastActive)}</span>
                      <span className="text-xs text-muted-foreground">{formatDate(session.lastActive)}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-xs text-muted-foreground">{formatDate(session.createdAt)}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleTerminateSession(session.id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Encerrar
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        
        <div className="mt-4 text-sm text-muted-foreground">
          <p>
            Para sua segurança, encerre as sessões em dispositivos que você não reconhece ou não está 
            usando mais. Se você perceber atividade suspeita, encerre a sessão e altere sua senha imediatamente.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default SessionManagement;
