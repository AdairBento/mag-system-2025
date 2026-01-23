'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';

interface Locacao {
  id: string;
  clienteId: string;
  veiculo: string;
  motorista: string;
  dataInicio: string;
  dataFim: string;
  dataFimReal?: string;
  quilometragemInicial: number;
  quilometragemFinal?: number;
  valorDiario: number;
  valorTotal: number;
  status: 'ativa' | 'finalizada' | 'cancelada';
  observacoes?: string;
  createdAt: string;
  updatedAt: string;
}

interface FormData {
  clienteId: string;
  veiculo: string;
  motorista: string;
  dataInicio: string;
  dataFim: string;
  quilometragemInicial: number;
  valorDiario: number;
  observacoes: string;
}

export default function LocacoesPage() {
  const router = useRouter();
  const [locacoes, setLocacoes] = useState<Locacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'todas' | 'ativa' | 'finalizada' | 'cancelada'>('todas');
  const [formData, setFormData] = useState<FormData>({
    clienteId: '',
    veiculo: '',
    motorista: '',
    dataInicio: '',
    dataFim: '',
    quilometragemInicial: 0,
    valorDiario: 0,
    observacoes: '',
  });

  useEffect(() => {
    fetchLocacoes();
  }, []);

  const fetchLocacoes = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/locacoes');
      if (!response.ok) throw new Error('Falha ao carregar locacoes');
      const data = await response.json();
      setLocacoes(data);
    } catch (error) {
      console.error('Erro:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'quilometragemInicial' || name === 'valorDiario' ? parseFloat(value) : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const method = editingId ? 'PUT' : 'POST';
      const url = editingId ? `/api/locacoes/${editingId}` : '/api/locacoes';
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!response.ok) throw new Error('Falha ao salvar');
      setIsFormOpen(false);
      setEditingId(null);
      setFormData({
        clienteId: '',
        veiculo: '',
        motorista: '',
        dataInicio: '',
        dataFim: '',
        quilometragemInicial: 0,
        valorDiario: 0,
        observacoes: '',
      });
      await fetchLocacoes();
    } catch (error) {
      console.error('Erro:', error);
    }
  };

  const handleEdit = (locacao: Locacao) => {
    setEditingId(locacao.id);
    setFormData({
      clienteId: locacao.clienteId,
      veiculo: locacao.veiculo,
      motorista: locacao.motorista,
      dataInicio: locacao.dataInicio,
      dataFim: locacao.dataFim,
      quilometragemInicial: locacao.quilometragemInicial,
      valorDiario: locacao.valorDiario,
      observacoes: locacao.observacoes || '',
    });
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza?')) return;
    try {
      const response = await fetch(`/api/locacoes/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Falha ao deletar');
      await fetchLocacoes();
    } catch (error) {
      console.error('Erro:', error);
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingId(null);
    setFormData({
      clienteId: '',
      veiculo: '',
      motorista: '',
      dataInicio: '',
      dataFim: '',
      quilometragemInicial: 0,
      valorDiario: 0,
      observacoes: '',
    });
  };

  const filteredLocacoes = locacoes.filter(l => {
    const matchesSearch = l.veiculo.toLowerCase().includes(searchTerm.toLowerCase()) || l.motorista.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'todas' || l.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div></div>;
  }

  const calcularDias = (dataInicio: string, dataFim: string) => {
    const inicio = new Date(dataInicio);
    const fim = new Date(dataFim);
    return Math.ceil((fim.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Locacoes</h1>
          <p className="text-gray-400">Gerenciamento de locacoes</p>
        </div>
        <Button onClick={() => setIsFormOpen(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg">
          Nova Locacao
        </Button>
      </div>

      <div className="flex gap-4 flex-wrap">
        <Input type="text" placeholder="Buscar..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="flex-1 min-w-[300px]" />
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as any)} className="px-4 py-2 rounded-lg bg-gray-700 text-white border border-gray-600">
          <option value="todas">Todos os Status</option>
          <option value="ativa">Ativas</option>
          <option value="finalizada">Finalizadas</option>
          <option value="cancelada">Canceladas</option>
        </select>
      </div>

      <div className="grid gap-4">
        {filteredLocacoes.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-gray-400">Nenhuma locacao encontrada</p>
          </Card>
        ) : (
          filteredLocacoes.map(locacao => (
            <Card key={locacao.id} className="p-6 hover:bg-gray-800 transition">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-semibold text-white">{locacao.veiculo}</h3>
                    <Badge className={locacao.status === 'ativa' ? 'bg-emerald-600 text-white' : locacao.status === 'finalizada' ? 'bg-blue-600 text-white' : 'bg-red-600 text-white'}>
                      {locacao.status}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm text-gray-400">
                    <div>Motorista: {locacao.motorista}</div>
                    <div>Cliente: {locacao.clienteId}</div>
                    <div>Data Inicio: {new Date(locacao.dataInicio).toLocaleDateString()}</div>
                    <div>Data Fim: {new Date(locacao.dataFim).toLocaleDateString()}</div>
                    <div>Quilometragem: {locacao.quilometragemInicial} km</div>
                    <div>Valor Diario: R$ {locacao.valorDiario.toFixed(2)}</div>
                    <div>Valor Total: R$ {locacao.valorTotal.toFixed(2)}</div>
                    <div>Dias: {calcularDias(locacao.dataInicio, locacao.dataFim)}</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => handleEdit(locacao)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
                    Editar
                  </Button>
                  <Button onClick={() => handleDelete(locacao.id)} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded">
                    Deletar
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      <Modal isOpen={isFormOpen} onClose={handleCloseForm} title={editingId ? 'Editar' : 'Nova'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input type="text" name="clienteId" placeholder="Cliente" value={formData.clienteId} onChange={handleInputChange} required />
            <Input type="text" name="veiculo" placeholder="Veiculo" value={formData.veiculo} onChange={handleInputChange} required />
            <Input type="text" name="motorista" placeholder="Motorista" value={formData.motorista} onChange={handleInputChange} required />
            <Input type="date" name="dataInicio" value={formData.dataInicio} onChange={handleInputChange} required />
            <Input type="date" name="dataFim" value={formData.dataFim} onChange={handleInputChange} required />
            <Input type="number" name="quilometragemInicial" placeholder="KM Inicial" value={formData.quilometragemInicial} onChange={handleInputChange} required />
            <Input type="number" step="0.01" name="valorDiario" placeholder="Valor" value={formData.valorDiario} onChange={handleInputChange} required />
          </div>
          <textarea name="observacoes" placeholder="Obs" value={formData.observacoes} onChange={handleInputChange as any} className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white border border-gray-600" rows={3} />
          <div className="flex gap-4 justify-end">
            <Button onClick={handleCloseForm} className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600">Cancelar</Button>
            <Button type="submit" className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700">Salvar</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
