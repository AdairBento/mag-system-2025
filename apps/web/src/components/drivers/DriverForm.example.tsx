"use client";

import { useState, FormEvent } from "react";
import { DriverMigrationModal } from "../modals/DriverMigrationModal";

/**
 * 📝 EXEMPLO DE INTEGRAÇÃO DO MODAL DE MIGRAÇÃO DE MOTORISTAS
 *
 * Este arquivo é um EXEMPLO de como integrar o DriverMigrationModal
 * no seu formulário de criação de motoristas.
 *
 * 🛠️ Para usar:
 * 1. Copie o código relevante para seu componente real
 * 2. Adapte os tipos e variáveis para seu contexto
 * 3. Integre com seu sistema de notificações (toast)
 * 4. Conecte com seu hook de listagem de clientes
 */

interface Driver {
  name: string;
  cpf: string;
  licenseNumber: string;
  clientId?: string;
  // ... outros campos
}

interface ExistingDriver {
  id: string;
  name: string;
  clientId: string | null;
  clientName: string | null;
}

interface Client {
  id: string;
  name: string;
}

export function DriverFormExample() {
  // Estados do formulário
  const [formData, setFormData] = useState<Partial<Driver>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estados do modal de migração
  const [isMigrationModalOpen, setIsMigrationModalOpen] = useState(false);
  const [existingDriver, setExistingDriver] = useState<ExistingDriver | null>(null);

  // Mock de clientes (substitua por seu hook real)
  const [clients] = useState<Client[]>([
    { id: "uuid-1", name: "Empresa A" },
    { id: "uuid-2", name: "Empresa B" },
  ]);

  /**
   * ✅ PASSO 1: Tentar criar motorista
   * Se CNH duplicada, captura erro 409 e abre modal
   */
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/drivers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.status === 409) {
        // 👉 CNH DUPLICADA: Capturar dados do motorista existente
        const errorData = await response.json();

        if (errorData.error === "DUPLICATE_LICENSE_NUMBER") {
          setExistingDriver(errorData.existingDriver);
          setIsMigrationModalOpen(true);
          return;
        }
      }

      if (!response.ok) {
        throw new Error("Erro ao criar motorista");
      }

      const newDriver = await response.json();
      console.log("✅ Motorista criado:", newDriver);

      // TODO: Adicionar toast de sucesso
      // TODO: Resetar formulário
      // TODO: Atualizar lista de motoristas
    } catch (error) {
      console.error("❌ Erro:", error);
      // TODO: Adicionar toast de erro
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * ✅ PASSO 2: Confirmar migração
   * Chama API POST /drivers/:id/migrate
   */
  const handleMigrationConfirm = async (driverId: string, newClientId: string | null) => {
    try {
      // Converter "__independent__" para null
      const clientIdToSend = newClientId === "__independent__" ? null : newClientId;

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/drivers/${driverId}/migrate`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ newClientId: clientIdToSend }),
        },
      );

      if (!response.ok) {
        throw new Error("Erro ao migrar motorista");
      }

      const migratedDriver = await response.json();
      console.log("✅ Motorista migrado:", migratedDriver);

      // TODO: Adicionar toast de sucesso
      // TODO: Atualizar lista de motoristas
      setIsMigrationModalOpen(false);
    } catch (error) {
      console.error("❌ Erro na migração:", error);
      throw error; // Propagar erro para o modal exibir
    }
  };

  /**
   * ✅ PASSO 3: Cancelar migração
   */
  const handleMigrationCancel = () => {
    setIsMigrationModalOpen(false);
    setExistingDriver(null);
  };

  return (
    <>
      {/* Formulário de Exemplo */}
      <form onSubmit={handleSubmit} className="space-y-4 p-6">
        <h2 className="text-2xl font-bold mb-4">Cadastrar Motorista</h2>

        <div>
          <label className="block text-sm font-medium text-gray-700">Nome Completo</label>
          <input
            type="text"
            value={formData.name || ""}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">CPF</label>
          <input
            type="text"
            value={formData.cpf || ""}
            onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            maxLength={11}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Número da CNH</label>
          <input
            type="text"
            value={formData.licenseNumber || ""}
            onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Cliente (Empresa)</label>
          <select
            value={formData.clientId || ""}
            onChange={(e) => setFormData({ ...formData, clientId: e.target.value || undefined })}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="">-- Nenhum (Independente) --</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.name}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {isSubmitting ? "Cadastrando..." : "Cadastrar Motorista"}
        </button>
      </form>

      {/* 🎯 Modal de Migração */}
      <DriverMigrationModal
        isOpen={isMigrationModalOpen}
        existingDriver={existingDriver}
        clients={clients}
        onConfirm={handleMigrationConfirm}
        onCancel={handleMigrationCancel}
      />
    </>
  );
}

/**
 * 📝 RESUMO DO FLUXO:
 *
 * 1. Usuário preenche formulário e clica "Cadastrar"
 * 2. handleSubmit() chama POST /drivers
 * 3. Se API retorna 409 Conflict:
 *    - Captura dados do motorista existente
 *    - Abre DriverMigrationModal
 * 4. Usuário escolhe novo cliente no modal
 * 5. handleMigrationConfirm() chama POST /drivers/:id/migrate
 * 6. Motorista é migrado com sucesso
 * 7. Modal fecha e lista é atualizada
 *
 * ⚡ MELHORIAS SUGERIDAS:
 * - Adicionar validação de CPF e CNH no frontend
 * - Integrar com sistema de notificações (toast)
 * - Adicionar campo de busca no dropdown de clientes
 * - Implementar cache da lista de clientes
 * - Adicionar confirmação antes de migrar
 * - Mostrar histórico de migrações (audit log)
 */
