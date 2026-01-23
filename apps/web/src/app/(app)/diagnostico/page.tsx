"use client";

import { useState, useEffect } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";

interface Diagnostico {
  id: string;
  veiculoId: string;
  dataInicio: string;
  dataFim?: string;
  tipo: "preventiva" | "corretiva" | "inspecao";
  problemas: string;
  solucao?: string;
  custoEstimado: number;
  custoPago?: number;
  status: "pendente" | "em_andamento" | "concluida";
  mecanico: string;
  observacoes?: string;
  createdAt: string;
  updatedAt: string;
}

interface FormData {
  veiculoId: string;
  tipo: "preventiva" | "corretiva" | "inspecao";
  problemas: string;
  solucao: string;
  custoEstimado: number;
  mecanico: string;
  observacoes: string;
}

export default function DiagnosticoPage() {
  const [diagnosticos, setDiagnosticos] = useState<Diagnostico[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "todos" | "pendente" | "em_andamento" | "concluida"
  >("todos");
  const [formData, setFormData] = useState<FormData>({
    veiculoId: "",
    tipo: "preventiva",
    problemas: "",
    solucao: "",
    custoEstimado: 0,
    mecanico: "",
    observacoes: "",
  });

  useEffect(() => {
    fetchDiagnosticos();
  }, []);

  const fetchDiagnosticos = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/diagnosticos");
      if (!response.ok) throw new Error("Falha ao carregar");
      const data = await response.json();
      setDiagnosticos(data);
    } catch (error) {
      console.error("Erro:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "custoEstimado" ? parseFloat(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const method = editingId ? "PUT" : "POST";
      const url = editingId ? `/api/diagnosticos/${editingId}` : "/api/diagnosticos";
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!response.ok) throw new Error("Falha ao salvar");
      setIsFormOpen(false);
      setEditingId(null);
      setFormData({
        veiculoId: "",
        tipo: "preventiva",
        problemas: "",
        solucao: "",
        custoEstimado: 0,
        mecanico: "",
        observacoes: "",
      });
      await fetchDiagnosticos();
    } catch (error) {
      console.error("Erro:", error);
    }
  };

  const handleEdit = (diag: Diagnostico) => {
    setEditingId(diag.id);
    setFormData({
      veiculoId: diag.veiculoId,
      tipo: diag.tipo,
      problemas: diag.problemas,
      solucao: diag.solucao || "",
      custoEstimado: diag.custoEstimado,
      mecanico: diag.mecanico,
      observacoes: diag.observacoes || "",
    });
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza?")) return;
    try {
      const response = await fetch(`/api/diagnosticos/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Falha ao deletar");
      await fetchDiagnosticos();
    } catch (error) {
      console.error("Erro:", error);
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingId(null);
    setFormData({
      veiculoId: "",
      tipo: "preventiva",
      problemas: "",
      solucao: "",
      custoEstimado: 0,
      mecanico: "",
      observacoes: "",
    });
  };

  const filteredDiagnosticos = diagnosticos.filter((d) => {
    const matchesSearch =
      d.veiculoId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.mecanico.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "todos" || d.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Diagnosticos</h1>
          <p className="text-gray-400">Gerenciamento de diagnosticos e manutencao</p>
        </div>
        <Button
          onClick={() => setIsFormOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg"
        >
          Novo Diagnostico
        </Button>
      </div>

      <div className="flex gap-4 flex-wrap">
        <Input
          type="text"
          placeholder="Buscar..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 min-w-[300px]"
        />
        <select
          value={filterStatus}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFilterStatus(e.target.value)}
          className="px-4 py-2 rounded-lg bg-gray-700 text-white border border-gray-600"
        >
          <option value="todos">Todos Status</option>
          <option value="pendente">Pendente</option>
          <option value="em_andamento">Em Andamento</option>
          <option value="concluida">Concluida</option>
        </select>
      </div>

      <div className="grid gap-4">
        {filteredDiagnosticos.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-gray-400">Nenhum diagnostico</p>
          </Card>
        ) : (
          filteredDiagnosticos.map((diag) => (
            <Card key={diag.id} className="p-6 hover:bg-gray-800 transition">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-semibold text-white">{diag.veiculoId}</h3>
                    <Badge
                      className={
                        diag.status === "pendente"
                          ? "bg-yellow-600 text-white"
                          : diag.status === "em_andamento"
                            ? "bg-blue-600 text-white"
                            : "bg-emerald-600 text-white"
                      }
                    >
                      {diag.status}
                    </Badge>
                    <Badge
                      className={
                        diag.tipo === "preventiva"
                          ? "bg-purple-600 text-white"
                          : diag.tipo === "corretiva"
                            ? "bg-red-600 text-white"
                            : "bg-cyan-600 text-white"
                      }
                    >
                      {diag.tipo}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm text-gray-400">
                    <div>Mecanico: {diag.mecanico}</div>
                    <div>Data: {new Date(diag.dataInicio).toLocaleDateString()}</div>
                    <div>Problemas: {diag.problemas}</div>
                    <div>Custo Est: R$ {diag.custoEstimado.toFixed(2)}</div>
                    {diag.solucao && <div className="col-span-2">Solucao: {diag.solucao}</div>}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleEdit(diag)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                  >
                    Editar
                  </Button>
                  <Button
                    onClick={() => handleDelete(diag.id)}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
                  >
                    Deletar
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      <Modal isOpen={isFormOpen} onClose={handleCloseForm} title={editingId ? "Editar" : "Novo"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              type="text"
              name="veiculoId"
              placeholder="Veiculo"
              value={formData.veiculoId}
              onChange={handleInputChange}
              required
            />
            <select
              name="tipo"
              value={formData.tipo}
              onChange={handleInputChange}
              className="px-4 py-2 rounded-lg bg-gray-700 text-white border border-gray-600"
            >
              <option value="preventiva">Preventiva</option>
              <option value="corretiva">Corretiva</option>
              <option value="inspecao">Inspecao</option>
            </select>
            <Input
              type="text"
              name="mecanico"
              placeholder="Mecanico"
              value={formData.mecanico}
              onChange={handleInputChange}
              required
            />
            <Input
              type="number"
              step="0.01"
              name="custoEstimado"
              placeholder="Custo"
              value={formData.custoEstimado}
              onChange={handleInputChange}
              required
            />
          </div>
          <textarea
            name="problemas"
            placeholder="Problemas"
            value={formData.problemas}
            onChange={handleInputChange}
            className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white border border-gray-600"
            rows={2}
            required
          />
          <textarea
            name="solucao"
            placeholder="Solucao"
            value={formData.solucao}
            onChange={handleInputChange}
            className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white border border-gray-600"
            rows={2}
          />
          <textarea
            name="observacoes"
            placeholder="Observacoes"
            value={formData.observacoes}
            onChange={handleInputChange}
            className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white border border-gray-600"
            rows={2}
          />
          <div className="flex gap-4 justify-end">
            <Button
              onClick={handleCloseForm}
              className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700"
            >
              Salvar
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
