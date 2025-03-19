
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Filter, Search } from 'lucide-react';
import { Input } from "@/components/ui/input";
import PartnerRequestCard, { PartnerRequestCardProps } from './PartnerRequestCard';
import { getPartnerships, Partnership } from '@/services/partnershipService';
import { Skeleton } from '@/components/ui/skeleton';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';

const PartnershipRequests = () => {
  const [partnerships, setPartnerships] = useState<Partnership[]>([]);
  const [filteredPartnerships, setFilteredPartnerships] = useState<Partnership[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  useEffect(() => {
    fetchPartnerships();
  }, []);

  useEffect(() => {
    filterPartnerships();
  }, [partnerships, searchTerm, statusFilter]);

  const fetchPartnerships = async () => {
    setLoading(true);
    try {
      const data = await getPartnerships();
      setPartnerships(data);
      setFilteredPartnerships(data);
    } catch (error) {
      console.error('Error fetching partnerships:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterPartnerships = () => {
    let filtered = [...partnerships];
    
    // Apply search term filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(p => 
        p.company_name.toLowerCase().includes(term) || 
        p.contact_name.toLowerCase().includes(term) || 
        p.email.toLowerCase().includes(term)
      );
    }
    
    // Apply status filter
    if (statusFilter) {
      filtered = filtered.filter(p => p.status === statusFilter);
    }
    
    setFilteredPartnerships(filtered);
  };

  const handleStatusChange = (id: string, status: string) => {
    setPartnerships(prev => 
      prev.map(request => 
        request.id === id ? { ...request, status: status as any } : request
      )
    );
  };

  const exportToCSV = () => {
    // Convert partnerships to CSV
    const headers = ["Empresa", "Contato", "Email", "Telefone", "Tipo", "Status", "Data"];
    const csvRows = [headers];

    filteredPartnerships.forEach(p => {
      csvRows.push([
        p.company_name,
        p.contact_name,
        p.email,
        p.phone,
        p.partnership_type,
        p.status,
        new Date(p.created_at).toLocaleDateString('pt-BR')
      ]);
    });

    // Convert to CSV string
    const csvContent = csvRows.map(row => row.join(',')).join('\n');
    
    // Create and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `parcerias_${new Date().toISOString().slice(0, 10)}.csv`);
    link.click();
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter(null);
  };

  const mapPartnershipToCard = (p: Partnership): PartnerRequestCardProps => ({
    id: p.id,
    companyName: p.company_name,
    contactName: p.contact_name,
    email: p.email,
    phone: p.phone,
    date: p.created_at,
    status: p.status,
    notes: p.notes,
    onStatusChange: handleStatusChange
  });

  const statusCounts = {
    all: partnerships.length,
    pending: partnerships.filter(p => p.status === 'pending').length,
    contacted: partnerships.filter(p => p.status === 'contacted').length,
    in_progress: partnerships.filter(p => p.status === 'in_progress').length,
    partnered: partnerships.filter(p => p.status === 'partnered').length,
    declined: partnerships.filter(p => p.status === 'declined').length,
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-2xl font-bold">Solicitações de Parceria</CardTitle>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-1"
              onClick={exportToCSV}
            >
              <Download className="h-4 w-4" />
              Exportar
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-1">
                  <Filter className="h-4 w-4" />
                  Filtrar
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setStatusFilter(null)}>
                  Todos ({statusCounts.all})
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter('pending')}>
                  Novos ({statusCounts.pending})
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter('contacted')}>
                  Contatados ({statusCounts.contacted})
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter('in_progress')}>
                  Em Progresso ({statusCounts.in_progress})
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter('partnered')}>
                  Parceria Fechada ({statusCounts.partnered})
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter('declined')}>
                  Recusados ({statusCounts.declined})
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por empresa, contato ou email..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        {statusFilter && (
          <div className="flex items-center gap-2 mb-4">
            <span className="text-sm text-muted-foreground">Filtrado por:</span>
            <Badge 
              variant="outline" 
              className="flex items-center gap-1 cursor-pointer"
              onClick={() => setStatusFilter(null)}
            >
              {statusFilter === 'pending' && 'Novos'}
              {statusFilter === 'contacted' && 'Contatados'}
              {statusFilter === 'in_progress' && 'Em Progresso'}
              {statusFilter === 'partnered' && 'Parceria Fechada'}
              {statusFilter === 'declined' && 'Recusados'}
              <span className="ml-1">×</span>
            </Badge>
            {(statusFilter || searchTerm) && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-7 text-xs"
                onClick={clearFilters}
              >
                Limpar filtros
              </Button>
            )}
          </div>
        )}
        
        {loading ? (
          // Loading skeleton
          Array(3).fill(0).map((_, i) => (
            <Card key={i} className="mb-4">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <Skeleton className="h-6 w-40" />
                    <Skeleton className="h-4 w-32 mt-2" />
                  </div>
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Skeleton className="h-4 w-10" />
                    <Skeleton className="h-5 w-32 mt-1" />
                  </div>
                  <div>
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-5 w-28 mt-1" />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-2 flex justify-between">
                <div className="flex gap-2">
                  <Skeleton className="h-9 w-20" />
                  <Skeleton className="h-9 w-24" />
                </div>
                <Skeleton className="h-8 w-32" />
              </CardFooter>
            </Card>
          ))
        ) : filteredPartnerships.length === 0 ? (
          <p className="text-center py-8 text-muted-foreground">
            {searchTerm || statusFilter ? 
              "Nenhuma solicitação de parceria encontrada com os filtros aplicados." : 
              "Nenhuma solicitação de parceria encontrada."}
          </p>
        ) : (
          filteredPartnerships.map(partnership => (
            <PartnerRequestCard 
              key={partnership.id}
              {...mapPartnershipToCard(partnership)}
            />
          ))
        )}
      </CardContent>
    </Card>
  );
};

export default PartnershipRequests;
