"use client";

import { useState, useEffect } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";

interface Transacao {
  id: string;
  tipo: "receita" | "despesa";
  descricao: string;
  valor: number;
  data: string;
  categoria: string;
  metodo: string;
  status: "pendente" | "pago" | "recebido";
  referencia?: string;
  observacoes?: string;
  createdAt: string;
  updatedAt: string;
}

interface FormData {
  tipo: "receita" | "despesa";
  descricao: string;
  valor: number;
  data: string;
  categoria: string;
  metodo: string;
  referencia: string;
  observacoes: string;
}

export default function FinanceiroPage() {
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTipo, setFilterTipo] = useState<"todos" | "receita" | "despesa">("todos");
  const [filterStatus, setFilterStatus] = useState<"todos" | "pendente" | "pago" | "recebido">(
    "todos",
  );
  const [formData, setFormData] = useState<FormData>({
    tipo: "receita",
    descricao: "",
    valor: 0,
    data: "",
    categoria: "",
    metodo: "",
    referencia: "",
    observacoes: "",
  });

  useEffect(() => {
    fetchTransacoes();
  }, []);

  const fetchTransacoes = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/financeiro");
      if (!response.ok) throw new Error("Falha ao carregar");
      const data = await response.json();
      setTransacoes(data);
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
    setFormData((prev) => ({ ...prev, [name]: name === "valor" ? parseFloat(value) : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const method = editingId ? "PUT" : "POST";
      const url = editingId ? `/api/financeiro/${editingId}` : "/api/financeiro";
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!response.ok) throw new Error("Falha ao salvar");
      setIsFormOpen(false);
      setEditingId(null);
      setFormData({
        tipo: "receita",
        descricao: "",
        valor: 0,
        data: "",
        categoria: "",
        metodo: "",
        referencia: "",
        observacoes: "",
      });
      await fetchTransacoes();
    } catch (error) {
      console.error("Erro:", error);
    }
  };

  const handleEdit = (trans: Transacao) => {
    setEditingId(trans.id);
    setFormData({
      tipo: trans.tipo,
      descricao: trans.descricao,
      valor: trans.valor,
      data: trans.data,
      categoria: trans.categoria,
      metodo: trans.metodo,
      referencia: trans.referencia || "",
      observacoes: trans.observacoes || "",
    });
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza?")) return;
    try {
      const response = await fetch(`/api/financeiro/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Falha ao deletar");
      await fetchTransacoes();
    } catch (error) {
      console.error("Erro:", error);
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingId(null);
    setFormData({
      tipo: "receita",
      descricao: "",
      valor: 0,
      data: "",
      categoria: "",
      metodo: "",
      referencia: "",
      observacoes: "",
    });
  };

  const filteredTransacoes = transacoes.filter((t) => {
    const matchesSearch =
      t.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.categoria.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTipo = filterTipo === "todos" || t.tipo === filterTipo;
    const matchesStatus = filterStatus === "todos" || t.status === filterStatus;
    return matchesSearch && matchesTipo && matchesStatus;
  });

  const totalReceitas = filteredTransacoes
    .filter((t) => t.tipo === "receita")
    .reduce((acc, t) => acc + t.valor, 0);
  const totalDespesas = filteredTransacoes
    .filter((t) => t.tipo === "despesa")
    .reduce((acc, t) => acc + t.valor, 0);
  const saldo = totalReceitas - totalDespesas;

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
          <h1 className="text-3xl font-bold text-white mb-2">Financeiro</h1>
          <p className="text-gray-400">Gerenciamento de contas a receber e pagar</p>
        </div>
        <Button
          onClick={() => setIsFormOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg"
        >
          Nova Transacao
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card className="p-6 border-l-4 border-emerald-600">
          <div className="text-gray-400 text-sm">Receitas</div>
          <div className="text-2xl font-bold text-emerald-600">R$ {totalReceitas.toFixed(2)}</div>
        </Card>
        <Card className="p-6 border-l-4 border-red-600">
          <div className="text-gray-400 text-sm">Despesas</div>
          <div className="text-2xl font-bold text-red-600">R$ {totalDespesas.toFixed(2)}</div>
        </Card>
        <Card
          className="p-6 border-l-4"
          style={{ borderColor: saldo >= 0 ? "#10b981" : "#ef4444" }}
        >
          <div className="text-gray-400 text-sm">Saldo</div>
          <div className="text-2xl font-bold" style={{ color: saldo >= 0 ? "#10b981" : "#ef4444" }}>
            R$ {saldo.toFixed(2)}
          </div>
        </Card>
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
          value={filterTipo}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFilterTipo(e.target.value)}
          className="px-4 py-2 rounded-lg bg-gray-700 text-white border border-gray-600"
        >
          <option value="todos">Todos Tipos</option>
          <option value="receita">Receitas</option>
          <option value="despesa">Despesas</option>
        </select>
        <select
          value={filterStatus}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFilterStatus(e.target.value)}
          className="px-4 py-2 rounded-lg bg-gray-700 text-white border border-gray-600"
        >
          <option value="todos">Todos Status</option>
          <option value="pendente">Pendente</option>
          <option value="pago">Pago</option>
          <option value="recebido">Recebido</option>
        </select>
      </div>

      <div className="grid gap-4">
        {filteredTransacoes.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-gray-400">Nenhuma transacao</p>
          </Card>
        ) : (
          filteredTransacoes.map((trans) => (
            <Card key={trans.id} className="p-6 hover:bg-gray-800 transition">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-semibold text-white">{trans.descricao}</h3>
                    <Badge
                      className={
                        trans.tipo === "receita"
                          ? "bg-emerald-600 text-white"
                          : "bg-red-600 text-white"
                      }
                    >
                      {trans.tipo}
                    </Badge>
                    <Badge
                      className={
                        trans.status === "pendente"
                          ? "bg-yellow-600 text-white"
                          : trans.status === "pago"
                            ? "bg-blue-600 text-white"
                            : "bg-purple-600 text-white"
                      }
                    >
                      {trans.status}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm text-gray-400">
                    <div>Valor: R$ {trans.valor.toFixed(2)}</div>
                    <div>Data: {new Date(trans.data).toLocaleDateString()}</div>
                    <div>Categoria: {trans.categoria}</div>
                    <div>Metodo: {trans.metodo}</div>
                    {trans.referencia && <div className="col-span-2">Ref: {trans.referencia}</div>}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleEdit(trans)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                  >
                    Editar
                  </Button>
                  <Button
                    onClick={() => handleDelete(trans.id)}
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

      <Modal isOpen={isFormOpen} onClose={handleCloseForm} title={editingId ? "Editar" : "Nova"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <select
              name="tipo"
              value={formData.tipo}
              onChange={handleInputChange}
              className="px-4 py-2 rounded-lg bg-gray-700 text-white border border-gray-600"
            >
              <option value="receita">Receita</option>
              <option value="despesa">Despesa</option>
            </select>
            <Input
              type="text"
              name="descricao"
              placeholder="Descricao"
              value={formData.descricao}
              onChange={handleInputChange}
              required
            />
            <Input
              type="number"
              step="0.01"
              name="valor"
              placeholder="Valor"
              value={formData.valor}
              onChange={handleInputChange}
              required
            />
            <Input
              type="date"
              name="data"
              value={formData.data}
              onChange={handleInputChange}
              required
            />
            <Input
              type="text"
              name="categoria"
              placeholder="Categoria"
              value={formData.categoria}
              onChange={handleInputChange}
              required
            />
            <Input
              type="text"
              name="metodo"
              placeholder="Metodo"
              value={formData.metodo}
              onChange={handleInputChange}
              required
            />
            <Input
              type="text"
              name="referencia"
              placeholder="Referencia"
              value={formData.referencia}
              onChange={handleInputChange}
            />
          </div>
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
