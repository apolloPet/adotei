
import { useEffect, useState } from 'react';
import { Container } from "@/components/ui/container";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Clock, CreditCard } from 'lucide-react';
import { getPaymentHistory, Payment } from '@/services/payment';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/auth';

const PaymentHistory = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { isAuthenticated } = useAuth();
  
  useEffect(() => {
    const fetchPayments = async () => {
      if (!isAuthenticated) return;
      
      setIsLoading(true);
      try {
        const paymentData = await getPaymentHistory();
        setPayments(paymentData);
      } catch (error) {
        console.error('Erro ao buscar histórico de pagamentos:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPayments();
  }, [isAuthenticated]);
  
  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">Concluído</Badge>;
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">Pendente</Badge>;
      case 'failed':
        return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">Falhou</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  const getPaymentMethodIcon = (method: string) => {
    switch (method.toLowerCase()) {
      case 'credit_card':
        return <CreditCard className="h-4 w-4" />;
      case 'pix':
        return <span className="font-medium text-xs">PIX</span>;
      default:
        return <CreditCard className="h-4 w-4" />;
    }
  };
  
  if (!isAuthenticated) {
    return (
      <Container className="py-10">
        <div className="max-w-3xl mx-auto text-center">
          <AlertCircle className="h-16 w-16 text-amber-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-4">Acesso Restrito</h1>
          <p className="mb-6">Você precisa estar logado para acessar esta página.</p>
          <Button asChild>
            <Link to="/login">Fazer Login</Link>
          </Button>
        </div>
      </Container>
    );
  }
  
  return (
    <Container className="py-10">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Histórico de Pagamentos</h1>
        <p className="text-muted-foreground mb-6">
          Veja todos os pagamentos relacionados às suas adoções.
        </p>
        
        <Card>
          <CardHeader className="bg-muted/50">
            <CardTitle>Pagamentos Realizados</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex justify-center items-center py-20">
                <div className="flex flex-col items-center">
                  <Clock className="h-8 w-8 animate-spin text-primary mb-4" />
                  <p>Carregando histórico de pagamentos...</p>
                </div>
              </div>
            ) : payments.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Nenhum pagamento encontrado.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Método</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>
                        {format(new Date(payment.payment_date || payment.created_at), 'dd/MM/yyyy HH:mm')}
                      </TableCell>
                      <TableCell className="font-medium">
                        R$ {payment.amount.toFixed(2)}
                      </TableCell>
                      <TableCell className="flex items-center gap-2">
                        {getPaymentMethodIcon(payment.payment_method)}
                        <span>{payment.payment_method === 'credit_card' ? 'Cartão de Crédito' : 'PIX'}</span>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(payment.payment_status)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </Container>
  );
};

export default PaymentHistory;
