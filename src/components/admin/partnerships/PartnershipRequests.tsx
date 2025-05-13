import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Filter, Plus, RefreshCw, Search, SlidersHorizontal } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-sonner";
import { Badge } from "@/components/ui/badge";
import PartnerRequestCard, { statusOptions } from './PartnerRequestCard';
import { getPartnerships, getPartnershipTypes, Partnership } from '@/services/partnershipService';
import { useAuditLog } from '@/hooks/auth/useAuditLog';

interface Filters {
  status?: string;
  type?: string;
  search?: string;
}

const PartnershipRequests = () => {
  const [partnerships, setPartnerships] = useState<Partnership[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<Filters>({});
  const [types, setTypes] = useState<string[]>([]);
  const { createLogEntry } = useAuditLog();

  useEffect(() => {
    fetchPartnerships();
    fetchPartnershipTypes();
  }, [filters]);

  const fetchPartnerships = async () => {
    setLoading(true);
    try {
      const fetchedPartnerships = await getPartnerships(filters);
      setPartnerships(fetchedPartnerships);
    } catch (error) {
      console.error("Failed to fetch partnerships:", error);
      toast.error("Failed to load partnership requests.");
    } finally {
      setLoading(false);
    }
  };

  const fetchPartnershipTypes = async () => {
    try {
      const partnershipTypes = await getPartnershipTypes();
      setTypes(partnershipTypes);
    } catch (error) {
      console.error("Failed to fetch partnership types:", error);
      toast.error("Failed to load partnership types.");
    }
  };

  const handleFilterChange = (newFilters: Filters) => {
    setFilters(prevFilters => ({ ...prevFilters, ...newFilters }));
  };

  const handleStatusChange = (id: string, newStatus: Partnership['status']) => {
    setPartnerships(prevPartnerships =>
      prevPartnerships.map(partnership =>
        partnership.id === id ? { ...partnership, status: newStatus } : partnership
      )
    );
  };

  const handleRefresh = () => {
    setFilters({});
    fetchPartnerships();
    createLogEntry({
      action: 'view',
      resource: 'partnerships',
      details: { message: 'Admin refreshed partnerships list' }
    });
  };

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>Solicitações de Parceria</CardTitle>
          <CardDescription>Gerencie as solicitações de parceria recebidas.</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="space-y-4">
            <TabsList>
              <TabsTrigger value="all">
                <Badge variant="secondary">
                  Todas <span className="ml-1 rounded-md bg-secondary px-2 py-0.5 text-xs font-medium ring-offset-background transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 dark:border-muted dark:bg-muted">
                    {partnerships.length}
                  </span>
                </Badge>
              </TabsTrigger>
              {statusOptions.map(option => (
                <TabsTrigger key={option.value} value={option.value}>
                  <Badge variant="secondary">
                    {option.label}
                    <span className="ml-1 rounded-md bg-secondary px-2 py-0.5 text-xs font-medium ring-offset-background transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 dark:border-muted dark:bg-muted">
                      {partnerships.filter(p => p.status === option.value).length}
                    </span>
                  </Badge>
                </TabsTrigger>
              ))}
            </TabsList>
            <Separator />
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <Input
                  type="search"
                  placeholder="Buscar..."
                  className="max-w-md"
                  onChange={(e) => handleFilterChange({ search: e.target.value })}
                />
                <Search className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="flex items-center space-x-2">
                <Select onValueChange={(value) => handleFilterChange({ type: value })}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filtrar por Tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {types.map(type => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm" onClick={handleRefresh}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Atualizar
                </Button>
                <Button variant="outline" size="sm">
                  <SlidersHorizontal className="h-4 w-4 mr-2" />
                  Filtros
                </Button>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Solicitação
                </Button>
              </div>
            </div>
            <Separator />
            {statusOptions.map(option => (
              <TabsContent key={option.value} value={option.value}>
                <div className="grid gap-4">
                  {loading ? (
                    <div>Carregando solicitações...</div>
                  ) : (
                    partnerships
                      .filter(partnership => filters.search ?
                        partnership.company_name.toLowerCase().includes(filters.search.toLowerCase()) ||
                        partnership.contact_name.toLowerCase().includes(filters.search.toLowerCase()) : true)
                      .filter(partnership => filters.type ? partnership.partnership_type === filters.type : true)
                      .filter(partnership => partnership.status === option.value)
                      .map(partnership => (
                        <PartnerRequestCard
                          key={partnership.id}
                          id={partnership.id}
                          companyName={partnership.company_name}
                          contactName={partnership.contact_name}
                          email={partnership.email}
                          phone={partnership.phone}
                          date={partnership.created_at}
                          status={partnership.status}
                          notes={partnership.notes}
                          onStatusChange={handleStatusChange}
                        />
                      ))
                  )}
                </div>
              </TabsContent>
            ))}
            <TabsContent value="all">
              <div className="grid gap-4">
                {loading ? (
                  <div>Carregando solicitações...</div>
                ) : (
                  partnerships
                    .filter(partnership => filters.search ?
                      partnership.company_name.toLowerCase().includes(filters.search.toLowerCase()) ||
                      partnership.contact_name.toLowerCase().includes(filters.search.toLowerCase()) : true)
                    .filter(partnership => filters.type ? partnership.partnership_type === filters.type : true)
                    .map(partnership => (
                      <PartnerRequestCard
                        key={partnership.id}
                        id={partnership.id}
                        companyName={partnership.company_name}
                        contactName={partnership.contact_name}
                        email={partnership.email}
                        phone={partnership.phone}
                        date={partnership.created_at}
                        status={partnership.status}
                        notes={partnership.notes}
                        onStatusChange={handleStatusChange}
                      />
                    ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter>
          {/* Footer content can be added here if needed */}
        </CardFooter>
      </Card>
    </div>
  );
};

export default PartnershipRequests;
