import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { apiRequest } from "@/lib/apiClient";
import { toast } from "@/hooks/use-sonner";
import { Checkbox } from "@/components/ui/checkbox";

type Vaccine = {
  id: string;
  code: string;
  name: string;
  animalType: "cachorro" | "gato";
  active: boolean;
};

type VaccinePayload = {
  code: string;
  name: string;
  animalType: "cachorro" | "gato";
  active: boolean;
};

const slugify = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

const buildCode = (name: string, animalType: "cachorro" | "gato") =>
  `${animalType === "cachorro" ? "DOG" : "CAT"}_${slugify(name)}_${Date.now().toString().slice(-6)}`;

const VaccineManagement = () => {
  const [vaccines, setVaccines] = useState<Vaccine[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [editing, setEditing] = useState<Vaccine | null>(null);
  const [form, setForm] = useState({
    name: "",
    animalType: "cachorro" as "cachorro" | "gato",
    active: true,
  });

  const orderedVaccines = useMemo(
    () => [...vaccines].sort((a, b) => a.name.localeCompare(b.name)),
    [vaccines],
  );

  const loadVaccines = async () => {
    try {
      const data = await apiRequest<Vaccine[]>("/api/vaccines");
      setVaccines(data);
    } catch (error) {
      console.error("Erro ao carregar vacinas:", error);
      toast.error("Não foi possível carregar as vacinas.");
    }
  };

  useEffect(() => {
    loadVaccines();
  }, []);

  const resetForm = () => {
    setEditing(null);
    setForm({ name: "", animalType: "cachorro", active: true });
  };

  const handleSave = async () => {
    const name = form.name.trim();
    if (!name) {
      toast.error("Nome da vacina é obrigatório.");
      return;
    }

    const payload: VaccinePayload = {
      code: editing?.code ?? buildCode(name, form.animalType),
      name,
      animalType: form.animalType,
      active: form.active,
    };

    try {
      setIsSaving(true);
      if (editing) {
        await apiRequest(`/api/vaccines/${editing.id}`, {
          method: "PUT",
          body: payload,
        });
        toast.success("Vacina atualizada com sucesso.");
      } else {
        await apiRequest("/api/vaccines", {
          method: "POST",
          body: payload,
        });
        toast.success("Vacina cadastrada com sucesso.");
      }
      await loadVaccines();
      resetForm();
    } catch (error) {
      console.error("Erro ao salvar vacina:", error);
      toast.error("Não foi possível salvar a vacina.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (vaccine: Vaccine) => {
    setEditing(vaccine);
    setForm({
      name: vaccine.name,
      animalType: vaccine.animalType,
      active: vaccine.active,
    });
  };

  const handleDelete = async (id: string) => {
    try {
      await apiRequest(`/api/vaccines/${id}`, { method: "DELETE" });
      toast.success("Vacina removida com sucesso.");
      await loadVaccines();
      if (editing?.id === id) {
        resetForm();
      }
    } catch (error) {
      console.error("Erro ao remover vacina:", error);
      toast.error("Não foi possível remover a vacina.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-md border p-4 space-y-4">
        <h3 className="font-semibold">{editing ? "Editar vacina" : "Cadastrar vacina"}</h3>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="vaccine-name">Nome da vacina</Label>
            <Input
              id="vaccine-name"
              value={form.name}
              onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
              placeholder="Ex: Proteção Múltipla"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="vaccine-type">Tipo de animal</Label>
            <select
              id="vaccine-type"
              className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
              value={form.animalType}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, animalType: event.target.value as "cachorro" | "gato" }))
              }
            >
              <option value="cachorro">Cachorro</option>
              <option value="gato">Gato</option>
            </select>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="vaccine-active"
            checked={form.active}
            onCheckedChange={(checked) => setForm((prev) => ({ ...prev, active: checked === true }))}
          />
          <Label htmlFor="vaccine-active">Vacina ativa para seleção no cadastro de animal</Label>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Salvando..." : editing ? "Salvar alterações" : "Cadastrar vacina"}
          </Button>
          {editing && (
            <Button variant="outline" onClick={resetForm}>
              Cancelar edição
            </Button>
          )}
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orderedVaccines.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  Nenhuma vacina cadastrada.
                </TableCell>
              </TableRow>
            )}
            {orderedVaccines.map((vaccine) => (
              <TableRow key={vaccine.id}>
                <TableCell>{vaccine.name}</TableCell>
                <TableCell className="capitalize">{vaccine.animalType}</TableCell>
                <TableCell>
                  <Badge variant={vaccine.active ? "default" : "secondary"}>
                    {vaccine.active ? "Ativa" : "Inativa"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(vaccine)}>
                    Editar
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(vaccine.id)}>
                    Excluir
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default VaccineManagement;
