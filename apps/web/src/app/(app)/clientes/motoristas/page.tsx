'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';

interface Motorista {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  cnh: string;
  validadeCNH: string;
  endereco: string;
  cidade: string;
  estado: string;
  cep: string;
  dataNascimento: string;
  cpf: string;
  status: 'ativo' | 'inativo';
  createdAt: string;
  updatedAt: string;
}

interface FormData {
  nome: string;
  email: string;
  telefone: string;
  cnh: string;
  validadeCNH: string;
  endereco: string;
  cidade: string;
  estado: string;
  cep: string;
  dataNascimento: string;
  cpf: string;
}

export default function MotoristasPage() {
  const router = useRouter();
  const [motoristas, setMotoristas] = useState<Motorista[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'todos' | 'ativo' | 'inativo'>('todos');
  const [formData, setFormData] = useState<FormData>({
    nome: '',
    email: '',
    telefone: '',
    cnh: '',
    validadeCNH: '',
    endereco: '',
    cidade: '',
    estado: '',
    cep: '',
    dataNascimento: '',
    cpf: '',
  });

  useEffect(() => {
    fetchMotoristas();
  }, []);

  const fetchMotoristas = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/clientes/motoristas');
      if (!response.ok) throw new Error('Falha ao carregar motoristas');
      const data = await response.json();
      setMotoristas(data);
    } catch (error) {
      console.error('Erro ao carregar motoristas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const method = editingId ? 'PUT' : 'POST';
      const url = editingId ? `/api/clientes/motoristas/${editingId}` : '/api/clientes/motoristas';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Falha ao salvar motorista');
      
      setIsFormOpen(false);
      setEditingId(null);
      setFormData({
        nome: '',
        email: '',
        telefone: '',
        cnh: '',
        validadeCNH: '',
        endereco: '',
        cidade: '',
        estado: '',
        cep: '',
        dataNascimento: '',
        cpf: '',
      });
      await fetchMotoristas();
    } catch (error) {
      console.error('Erro ao salvar motorista:', error);
    }
  };

  const handleEdit = (motorista: Motorista) => {
    setEditingId(motorista.id);
    setFormData({
      nome: motorista.nome,
      email: motorista.email,
      telefone: motorista.telefone,
      cnh: motorista.cnh,
      validadeCNH: motorista.validadeCNH,
      endereco: motorista.endereco,
      cidade: motorista.cidade,
      estado: motorista.estado,
      cep: motorista.cep,
      dataNascimento: motorista.dataNascimento,
      cpf: motorista.cpf,
    });
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja deletar este motorista?')) return;
    try {
      const response = await fetch(`/api/clientes/motoristas/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Falha ao deletar motorista');
      await fetchMotoristas();
    } catch (error) {
      console.error('Erro ao deletar motorista:', error);
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingId(null);
    setFormData({
      nome: '',
      email: '',
      telefone: '',
      cnh: '',
      validadeCNH: '',
      endereco: '',
      cidade: '',
      estado: '',
      cep: '',
      dataNascimento: '',
      cpf: '',
    });
  };

  const filteredMotoristas = motoristas.filter(m => {
    const matchesSearch = m.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         m.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         m.cnh.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         m.cpf.includes(searchTerm);
    const matchesStatus = filterStatus === 'todos' || m.status === filterStatus;
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
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Motoristas</h1>
          <p className="text-gray-400">Gerenciamento de motoristas do cliente</p>
        </div>
        <Button
          onClick={() => setIsFormOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg"
        >
          Novo Motorista
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-4 flex-wrap">
        <Input
          type="text"
          placeholder="Buscar por nome, email, CNH ou CPF..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 min-w-[300px]"
        />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as any)}
          className="px-4 py-2 rounded-lg bg-gray-700 text-white border border-gray-600"
        >
          <option value="todos">Todos os Status</option>
          <option value="ativo">Ativos</option>
          <option value="inativo">Inativos</option>
        </select>
      </div>

      {/* List */}
      <div className="grid gap-4">
        {filteredMotoristas.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-gray-400">Nenhum motorista encontrado</p>
          </Card>
        ) : (
          filteredMotoristas.map(motorista => (
            <Card key={motorista.id} className="p-6 hover:bg-gray-800 transition">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-semibold text-white">{motorista.nome}</h3>
                    <Badge 
                      className={motorista.status === 'ativo' 
                        ? 'bg-emerald-600 text-white' 
                        : 'bg-red-600 text-white'}
                    >
                      {motorista.status === 'ativo' ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm text-gray-400">
                    <div>Email: {motorista.email}</div>
                    <div>Telefone: {motorista.telefone}</div>
                    <div>CPF: {motorista.cpf}</div>
                    <div>CNH: {motorista.cnh}</div>
                    <div>Validade CNH: {motorista.validadeCNH}</div>
                    <div>Data Nascimento: {motorista.dataNascimento}</div>
                    <div className="col-span-2">Endereço: {motorista.endereco}, {motorista.cidade} - {motorista.estado} {motorista.cep}</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleEdit(motorista)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                  >
                    Editar
                  </Button>
                  <Button
                    onClick={() => handleDelete(motorista.id)}
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

      {/* Modal Form */}
      <Modal isOpen={isFormOpen} onClose={handleCloseForm} title={editingId ? 'Editar Motorista' : 'Novo Motorista'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              type="text"
              name="nome"
              placeholder="Nome"
              value={formData.nome}
              onChange={handleInputChange}
              required
            />
            <Input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
            <Input
              type="tel"
              name="telefone"
              placeholder="Telefone"
              value={formData.telefone}
              onChange={handleInputChange}
              required
            />
            <Input
              type="text"
              name="cpf"
              placeholder="CPF"
              value={formData.cpf}
              onChange={handleInputChange}
              required
            />
            <Input
              type="text"
              name="cnh"
              placeholder="CNH"
              value={formData.cnh}
              onChange={handleInputChange}
              required
            />
            <Input
              type="date"
              name="validadeCNH"
              placeholder="Validade CNH"
              value={formData.validadeCNH}
              onChange={handleInputChange}
              required
            />
            <Input
              type="date"
              name="dataNascimento"
              placeholder="Data Nascimento"
              value={formData.dataNascimento}
              onChange={handleInputChange}
              required
            />
            <Input
              type="text"
              name="endereco"
              placeholder="Endereço"
              value={formData.endereco}
              onChange={handleInputChange}
              required
            />
            <Input
              type="text"
              name="cidade"
              placeholder="Cidade"
              value={formData.cidade}
              onChange={handleInputChange}
              required
            />
            <Input
              type="text"
              name="estado"
              placeholder="Estado"
              value={formData.estado}
              onChange={handleInputChange}
              required
            />
            <Input
              type="text"
              name="cep"
              placeholder="CEP"
              value={formData.cep}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="flex gap-4 justify-end">
            <Button onClick={handleCloseForm} className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600">
              Cancelar
            </Button>
            <Button type="submit" className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700">
              Salvar
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
