
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, UserCheck, UserX, Calendar, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-sonner';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface MetricsData {
  id: string;
  date: string;
  total_users: number;
  new_users: number;
  active_users: number;
  completed_adoptions: number;
  pending_adoptions: number;
  rejected_adoptions: number;
}

const UserMetricsDashboard = () => {
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [historicalData, setHistoricalData] = useState<MetricsData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('week');

  useEffect(() => {
    fetchUserMetrics();
  }, [timeframe]);

  const fetchUserMetrics = async () => {
    setIsLoading(true);
    try {
      // First try to get the latest metrics
      const { data: latestData, error: latestError } = await supabase
        .from('user_metrics')
        .select('*')
        .order('date', { ascending: false })
        .limit(1);

      if (latestError) throw latestError;
      
      // If we don't have metrics yet, call the function to generate them
      if (!latestData || latestData.length === 0) {
        await generateMetrics();
        
        // Fetch again after generating
        const { data: newData, error: newError } = await supabase
          .from('user_metrics')
          .select('*')
          .order('date', { ascending: false })
          .limit(1);
          
        if (newError) throw newError;
        if (newData && newData.length > 0) {
          setMetrics(newData[0]);
        }
      } else {
        setMetrics(latestData[0]);
      }
      
      // Get historical data based on timeframe
      let daysToFetch = 7;
      if (timeframe === 'month') daysToFetch = 30;
      if (timeframe === 'year') daysToFetch = 365;
      
      const { data: histData, error: histError } = await supabase
        .from('user_metrics')
        .select('*')
        .order('date', { ascending: false })
        .limit(daysToFetch);
        
      if (histError) throw histError;
      
      if (histData) {
        // Reverse to get chronological order for charts
        setHistoricalData(histData.reverse());
      }
      
    } catch (error) {
      console.error('Error fetching user metrics:', error);
      toast.error('Erro ao buscar métricas de usuários');
    } finally {
      setIsLoading(false);
    }
  };

  const generateMetrics = async () => {
    try {
      // Call the Supabase function to calculate metrics
      const { error } = await supabase.rpc('calculate_daily_user_metrics');
      
      if (error) throw error;
      
      toast.success('Métricas geradas com sucesso');
    } catch (error) {
      console.error('Error generating metrics:', error);
      toast.error('Erro ao gerar métricas');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const StatCard = ({ title, value, icon: Icon, change = 0, changeType = 'neutral' }) => {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">{title}</p>
              <h3 className="text-2xl font-bold mt-1">{value}</h3>
              {change !== 0 && (
                <p className={`text-xs flex items-center mt-1 ${
                  changeType === 'positive' ? 'text-green-500' : 
                  changeType === 'negative' ? 'text-red-500' : 'text-gray-500'
                }`}>
                  {changeType === 'positive' ? <ArrowUpRight className="mr-1 h-3 w-3" /> : 
                   changeType === 'negative' ? <ArrowDownRight className="mr-1 h-3 w-3" /> : null}
                  {Math.abs(change)}% desde ontem
                </p>
              )}
            </div>
            <div className="p-2 bg-primary/10 rounded-full">
              <Icon className="h-6 w-6 text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Métricas de Usuários e Adoções</CardTitle>
        <CardDescription>Visão geral das estatísticas de usuários e processos de adoção</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            <div className="flex justify-end mb-6">
              <Tabs value={timeframe} onValueChange={setTimeframe} className="w-auto">
                <TabsList>
                  <TabsTrigger value="week">Semana</TabsTrigger>
                  <TabsTrigger value="month">Mês</TabsTrigger>
                  <TabsTrigger value="year">Ano</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            
            {metrics ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                  <StatCard 
                    title="Total de Usuários" 
                    value={metrics.total_users} 
                    icon={Users} 
                  />
                  <StatCard 
                    title="Novos Usuários (24h)" 
                    value={metrics.new_users} 
                    icon={UserCheck} 
                    change={5} 
                    changeType="positive" 
                  />
                  <StatCard 
                    title="Usuários Ativos (7 dias)" 
                    value={metrics.active_users} 
                    icon={Users} 
                  />
                  <StatCard 
                    title="Adoções Concluídas" 
                    value={metrics.completed_adoptions} 
                    icon={UserCheck} 
                  />
                  <StatCard 
                    title="Adoções Pendentes" 
                    value={metrics.pending_adoptions} 
                    icon={Calendar} 
                  />
                  <StatCard 
                    title="Adoções Rejeitadas" 
                    value={metrics.rejected_adoptions} 
                    icon={UserX} 
                  />
                </div>
                
                <Tabs defaultValue="users" className="w-full">
                  <TabsList className="w-full mb-4">
                    <TabsTrigger value="users">Usuários</TabsTrigger>
                    <TabsTrigger value="adoptions">Adoções</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="users">
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={historicalData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" tickFormatter={formatDate} />
                          <YAxis />
                          <Tooltip formatter={(value) => [value, 'Quantidade']} labelFormatter={formatDate} />
                          <Legend />
                          <Bar dataKey="total_users" name="Total de Usuários" fill="#6366f1" />
                          <Bar dataKey="new_users" name="Novos Usuários" fill="#22c55e" />
                          <Bar dataKey="active_users" name="Usuários Ativos" fill="#eab308" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="adoptions">
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={historicalData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" tickFormatter={formatDate} />
                          <YAxis />
                          <Tooltip formatter={(value) => [value, 'Quantidade']} labelFormatter={formatDate} />
                          <Legend />
                          <Bar dataKey="completed_adoptions" name="Adoções Concluídas" fill="#22c55e" />
                          <Bar dataKey="pending_adoptions" name="Adoções Pendentes" fill="#eab308" />
                          <Bar dataKey="rejected_adoptions" name="Adoções Rejeitadas" fill="#ef4444" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </TabsContent>
                </Tabs>
              </>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Nenhuma métrica disponível ainda.</p>
                <button 
                  onClick={generateMetrics}
                  className="mt-2 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
                >
                  Gerar Métricas
                </button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default UserMetricsDashboard;
