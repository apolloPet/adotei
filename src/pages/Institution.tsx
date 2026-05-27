import { useCallback, useEffect, useMemo, useState } from 'react';
import Footer from '@/components/home/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-sonner';
import { useAuth } from '@/hooks/auth';
import { apiRequest } from '@/lib/apiClient';
import {
  fetchPublicOrganization,
  fetchPublicOrganizations,
  OrganizationPublicDetail,
  OrganizationPublicSummary,
} from '@/services/organizationProfileService';
import OrganizationProfileEditDialog from '@/components/institution/OrganizationProfileEditDialog';
import {
  Building2,
  Calendar,
  Facebook,
  Globe,
  Instagram,
  Mail,
  MapPin,
  PawPrint,
  Pencil,
  Phone,
  Users,
} from 'lucide-react';

type CurrentUser = {
  id: string;
  userType: string;
  organizationId?: string;
  organizationResponsible?: boolean;
};

const Institution = () => {
  const { isAuthenticated, isAdmin } = useAuth();
  const [organizations, setOrganizations] = useState<OrganizationPublicSummary[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<OrganizationPublicDetail | null>(null);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [editOpen, setEditOpen] = useState(false);

  const loadList = useCallback(async () => {
    try {
      setLoadingList(true);
      const data = await fetchPublicOrganizations();
      setOrganizations(data);
      if (data.length > 0) {
        setSelectedId((current) => current ?? data[0].id);
      } else {
        setSelectedId(null);
        setDetail(null);
      }
    } catch (error) {
      console.error('Erro ao carregar ONGs:', error);
      toast.error('Não foi possível carregar as ONGs parceiras.');
    } finally {
      setLoadingList(false);
    }
  }, []);

  const loadDetail = useCallback(async (id: string) => {
    try {
      setLoadingDetail(true);
      const data = await fetchPublicOrganization(id);
      setDetail(data);
    } catch (error) {
      console.error('Erro ao carregar detalhes da ONG:', error);
      toast.error('Não foi possível carregar os detalhes da ONG.');
      setDetail(null);
    } finally {
      setLoadingDetail(false);
    }
  }, []);

  useEffect(() => {
    void loadList();
  }, [loadList]);

  useEffect(() => {
    if (selectedId) {
      void loadDetail(selectedId);
    }
  }, [selectedId, loadDetail]);

  useEffect(() => {
    if (!isAuthenticated) {
      setCurrentUser(null);
      return;
    }
    (async () => {
      try {
        const me = await apiRequest<CurrentUser>('/api/users/me');
        setCurrentUser(me);
      } catch {
        setCurrentUser(null);
      }
    })();
  }, [isAuthenticated]);

  const canEdit = useMemo(() => {
    if (!detail || !isAuthenticated) return false;
    if (isAdmin) return true;
    return (
      currentUser?.userType === 'VOLUNTARIO' &&
      currentUser.organizationResponsible === true &&
      currentUser.organizationId === detail.id
    );
  }, [detail, isAuthenticated, isAdmin, currentUser]);

  const handleSaved = (saved: OrganizationPublicDetail) => {
    setDetail(saved);
    setOrganizations((prev) =>
      prev
        .map((org) =>
          org.id === saved.id
            ? {
                ...org,
                legalName: saved.legalName,
                tradeName: saved.tradeName,
                displayName: saved.displayName,
                city: saved.city,
                state: saved.state,
                aboutText: saved.aboutText,
                missionFocus: saved.missionFocus,
                foundedYear: saved.foundedYear,
                logoUrl: saved.logoUrl,
                animalsCount: saved.animalsCount,
              }
            : org,
        )
        .filter((org) => saved.published || org.id !== saved.id),
    );
    if (!saved.published && selectedId === saved.id) {
      void loadList();
    }
  };

  const locationLabel = detail
    ? [detail.city, detail.state].filter(Boolean).join(' — ')
    : '';

  return (
    <div className="min-h-screen bg-pet-neutral">
      <main className="container mx-auto px-4 pt-28 pb-16">
        <div className="mx-auto mb-8 max-w-6xl text-center">
          <h1 className="text-3xl font-extrabold text-pet-primary-dark md:text-4xl">ONGs Parceiras</h1>
          <p className="mt-3 text-base text-pet-secondary/80 max-w-2xl mx-auto">
            Conheça as organizações cadastradas na plataforma, sua história, equipe e formas de contato.
          </p>
        </div>

        {loadingList ? (
          <div className="flex justify-center py-16 text-muted-foreground">Carregando ONGs parceiras...</div>
        ) : organizations.length === 0 ? (
          <Card className="mx-auto max-w-2xl">
            <CardContent className="py-12 text-center text-muted-foreground">
              Nenhuma ONG parceira publicada no momento.
            </CardContent>
          </Card>
        ) : (
          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 lg:grid-cols-12">
            <aside className="lg:col-span-4 space-y-3">
              {organizations.map((org) => {
                const active = org.id === selectedId;
                return (
                  <button
                    key={org.id}
                    type="button"
                    onClick={() => setSelectedId(org.id)}
                    className={`w-full rounded-2xl border p-4 text-left transition shadow-sm ${
                      active
                        ? 'border-pet-primary bg-white ring-2 ring-pet-primary/30'
                        : 'border-pet-secondary/10 bg-white hover:border-pet-primary/40'
                    }`}
                  >
                    <div className="flex gap-3">
                      {org.logoUrl ? (
                        <img
                          src={org.logoUrl}
                          alt={org.displayName}
                          className="h-14 w-14 rounded-xl object-cover border shrink-0"
                        />
                      ) : (
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-pet-neutral">
                          <Building2 className="h-7 w-7 text-pet-primary/70" />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-pet-primary-dark truncate">{org.displayName}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {[org.city, org.state].filter(Boolean).join(' · ')}
                        </p>
                        {org.missionFocus && (
                          <p className="text-xs text-pet-secondary/80 mt-2 line-clamp-2">{org.missionFocus}</p>
                        )}
                        <div className="mt-2 flex flex-wrap gap-2">
                          {org.foundedYear && (
                            <Badge variant="secondary" className="text-xs">
                              Desde {org.foundedYear}
                            </Badge>
                          )}
                          <Badge variant="outline" className="text-xs">
                            <PawPrint className="h-3 w-3 mr-1" />
                            {org.animalsCount} {org.animalsCount === 1 ? 'animal' : 'animais'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </aside>

            <section className="lg:col-span-8">
              {loadingDetail || !detail ? (
                <Card>
                  <CardContent className="py-16 text-center text-muted-foreground">
                    {loadingDetail ? 'Carregando perfil da ONG...' : 'Selecione uma ONG para ver os detalhes.'}
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-6">
                  <Card className="overflow-hidden">
                    <CardContent className="p-6 sm:p-8">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex gap-4">
                          {detail.logoUrl ? (
                            <img
                              src={detail.logoUrl}
                              alt={detail.displayName}
                              className="h-20 w-20 rounded-2xl object-cover border"
                            />
                          ) : (
                            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-pet-neutral">
                              <Building2 className="h-10 w-10 text-pet-primary/70" />
                            </div>
                          )}
                          <div>
                            <h2 className="text-2xl font-extrabold text-pet-primary-dark">{detail.displayName}</h2>
                            {detail.tradeName && detail.tradeName !== detail.legalName && (
                              <p className="text-sm text-muted-foreground mt-1">{detail.legalName}</p>
                            )}
                            <div className="mt-2 flex flex-wrap gap-2">
                              {detail.foundedYear && (
                                <Badge variant="secondary">
                                  <Calendar className="h-3 w-3 mr-1" />
                                  Fundada em {detail.foundedYear}
                                </Badge>
                              )}
                              <Badge variant="outline">
                                <PawPrint className="h-3 w-3 mr-1" />
                                {detail.animalsCount} animais cadastrados
                              </Badge>
                            </div>
                          </div>
                        </div>
                        {canEdit && (
                          <Button variant="outline" className="shrink-0" onClick={() => setEditOpen(true)}>
                            <Pencil className="h-4 w-4 mr-2" />
                            Editar perfil
                          </Button>
                        )}
                      </div>

                      {detail.aboutText && (
                        <div className="mt-6">
                          <h3 className="text-lg font-bold text-pet-secondary mb-2">Quem somos</h3>
                          <p className="text-sm leading-relaxed text-pet-secondary/90 whitespace-pre-line">
                            {detail.aboutText}
                          </p>
                        </div>
                      )}

                      {detail.storyText && (
                        <div className="mt-6 rounded-2xl bg-pet-neutral p-5">
                          <h3 className="text-lg font-bold text-pet-secondary mb-2">Nossa história</h3>
                          <p className="text-sm leading-relaxed text-pet-secondary/90 whitespace-pre-line">
                            {detail.storyText}
                          </p>
                        </div>
                      )}

                      {detail.missionFocus && (
                        <div className="mt-6">
                          <h3 className="text-lg font-bold text-pet-secondary mb-2">Missão</h3>
                          <p className="text-sm text-pet-secondary/90">{detail.missionFocus}</p>
                        </div>
                      )}

                      {detail.structureInfo && (
                        <div className="mt-6">
                          <h3 className="text-lg font-bold text-pet-secondary mb-2">Estrutura e atuação</h3>
                          <p className="text-sm leading-relaxed text-pet-secondary/90 whitespace-pre-line">
                            {detail.structureInfo}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                      <CardContent className="p-6 space-y-4">
                        <h3 className="text-lg font-bold text-pet-secondary flex items-center gap-2">
                          <Users className="h-5 w-5" />
                          Equipe e responsáveis
                        </h3>
                        {detail.volunteers.length === 0 ? (
                          <p className="text-sm text-muted-foreground">Nenhum voluntário cadastrado.</p>
                        ) : (
                          <ul className="space-y-3">
                            {detail.volunteers.map((volunteer) => (
                              <li
                                key={volunteer.id}
                                className="flex items-start justify-between gap-3 rounded-xl border p-3"
                              >
                                <div>
                                  <p className="font-semibold text-pet-primary-dark">{volunteer.fullName}</p>
                                  {volunteer.phone && (
                                    <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                                      <Phone className="h-3.5 w-3.5" />
                                      {volunteer.phone}
                                    </p>
                                  )}
                                </div>
                                <Badge variant={volunteer.organizationResponsible ? 'default' : 'secondary'}>
                                  {volunteer.organizationResponsible ? 'Responsável' : 'Voluntário'}
                                </Badge>
                              </li>
                            ))}
                          </ul>
                        )}
                        <p className="text-xs text-muted-foreground">
                          Contato institucional: {detail.primaryContactName}
                          {detail.secondaryContactName ? ` · ${detail.secondaryContactName}` : ''}
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-6 space-y-4">
                        <h3 className="text-lg font-bold text-pet-secondary">Contato</h3>
                        <div className="space-y-3 text-sm">
                          {locationLabel && (
                            <p className="flex items-start gap-2 text-pet-secondary/90">
                              <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                              <span>
                                {detail.addressLine ? `${detail.addressLine} — ` : ''}
                                {locationLabel}
                              </span>
                            </p>
                          )}
                          <p className="flex items-center gap-2">
                            <Phone className="h-4 w-4 shrink-0" />
                            {detail.contactPhone1}
                            {detail.contactPhone2 ? ` · ${detail.contactPhone2}` : ''}
                          </p>
                          {detail.contactEmail && (
                            <p className="flex items-center gap-2">
                              <Mail className="h-4 w-4 shrink-0" />
                              <a href={`mailto:${detail.contactEmail}`} className="text-pet-primary hover:underline">
                                {detail.contactEmail}
                              </a>
                            </p>
                          )}
                          {detail.cnpj && (
                            <p className="text-muted-foreground">CNPJ: {detail.cnpj}</p>
                          )}
                        </div>

                        {(detail.websiteUrl || detail.instagramUrl || detail.facebookUrl) && (
                          <div className="pt-2">
                            <h4 className="text-sm font-semibold text-pet-secondary mb-2">Redes e site</h4>
                            <div className="flex flex-wrap gap-2">
                              {detail.websiteUrl && (
                                <Button variant="outline" size="sm" asChild>
                                  <a href={detail.websiteUrl} target="_blank" rel="noopener noreferrer">
                                    <Globe className="h-4 w-4 mr-1" /> Site
                                  </a>
                                </Button>
                              )}
                              {detail.instagramUrl && (
                                <Button variant="outline" size="sm" asChild>
                                  <a href={detail.instagramUrl} target="_blank" rel="noopener noreferrer">
                                    <Instagram className="h-4 w-4 mr-1" /> Instagram
                                  </a>
                                </Button>
                              )}
                              {detail.facebookUrl && (
                                <Button variant="outline" size="sm" asChild>
                                  <a href={detail.facebookUrl} target="_blank" rel="noopener noreferrer">
                                    <Facebook className="h-4 w-4 mr-1" /> Facebook
                                  </a>
                                </Button>
                              )}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}
            </section>
          </div>
        )}
      </main>

      <OrganizationProfileEditDialog
        open={editOpen}
        organization={detail}
        onOpenChange={setEditOpen}
        onSaved={handleSaved}
      />

      <Footer />
    </div>
  );
};

export default Institution;
