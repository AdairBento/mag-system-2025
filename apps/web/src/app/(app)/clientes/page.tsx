// apps/web/src/app/(app)/clientes/page.tsx
"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { Tabs } from "./_components/tabs";

import { getClients, type Client, type ClientFilters } from "@/lib/api/clients";
import {
  getDrivers,
  createDriver,
  updateDriver,
  deleteDriver,
  migrateDriver,
  type CreateDriverPayload,
  type UpdateDriverPayload,
} from "@/lib/api/drivers";
import type { Driver, DriverFilters } from "@/types/driver";

// existentes (clientes)
import { ClientFiltersBar } from "./_components/client-filters";
import { ClientTable } from "./_components/client-table";
import { ClientFormModal, type ClientFormData } from "./_components/client-form-modal";

// novos (motoristas)
import { DriverFiltersBar } from "./_components/driver-filters";
import { DriverTable } from "./_components/driver-table";
import { DriverFormModal } from "./_components/driver-form-modal";
import { MigrateDriverModal } from "./_components/migrate-driver-modal";

type TabKey = "clients" | "drivers";

function isPJ(c: Client) {
  return c.type === "PJ";
}

export default function ClientesPage() {
  const qc = useQueryClient();

  const [tab, setTab] = useState<TabKey>("clients");

  // CLIENTES
  const [clientFilters, setClientFilters] = useState<ClientFilters>({
    search: "",
    type: "ALL",
    status: "ALL",
  });
  const [clientPage, setClientPage] = useState(1);
  const [clientLimit] = useState(10);

  const clientsQ = useQuery({
    queryKey: ["clients", clientFilters, clientPage, clientLimit],
    queryFn: () => getClients(clientFilters, clientPage, clientLimit),
  });

  const clients = clientsQ.data?.data ?? [];
  const pjCompanies = clients
    .filter(isPJ)
    .map((c) => ({ id: c.id, label: c.nomeFantasia || c.razaoSocial || `PJ ${c.id.slice(0, 6)}` }));

  // MODAL CLIENTE (usa o seu componente existente)
  const [clientModalOpen, setClientModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  // MOTORISTAS
  const [driverFilters, setDriverFilters] = useState<DriverFilters>({ search: "", clientId: "" });
  const [driverPage, setDriverPage] = useState(1);
  const [driverLimit] = useState(10);

  const driversQ = useQuery({
    queryKey: ["drivers", driverFilters, driverPage, driverLimit],
    queryFn: () => getDrivers(driverFilters, driverPage, driverLimit),
  });

  const drivers = driversQ.data?.data ?? [];

  // MODAL MOTORISTA
  const [driverModalOpen, setDriverModalOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);

  // MODAL MIGRAÇÃO
  const [migrateOpen, setMigrateOpen] = useState(false);
  const [selectedDriverForMigrate, setSelectedDriverForMigrate] = useState<Driver | null>(null);

  // MUTATIONS MOTORISTA
  const createDriverM = useMutation({
    mutationFn: (payload: CreateDriverPayload) => createDriver(payload),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["drivers"] });
      setDriverModalOpen(false);
      setEditingDriver(null);
    },
  });

  const updateDriverM = useMutation({
    mutationFn: (args: { id: string; payload: UpdateDriverPayload }) =>
      updateDriver(args.id, args.payload),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["drivers"] });
      setDriverModalOpen(false);
      setEditingDriver(null);
    },
  });

  const deleteDriverM = useMutation({
    mutationFn: (id: string) => deleteDriver(id),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["drivers"] });
    },
  });

  const migrateDriverM = useMutation({
    mutationFn: (args: { driverId: string; newClientId: string }) =>
      migrateDriver(args.driverId, { newClientId: args.newClientId }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["drivers"] });
      setMigrateOpen(false);
      setSelectedDriverForMigrate(null);
    },
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl font-semibold">{tab === "clients" ? "Clientes" : "Motoristas"}</h1>
          <p className="text-sm text-gray-600">
            {tab === "clients"
              ? "Cadastre clientes PF/PJ e gerencie status."
              : "Cadastre motoristas e gerencie vínculo com empresas via migração."}
          </p>
        </div>

        <Tabs value={tab} onChange={setTab} />
      </div>

      {tab === "clients" ? (
        <>
          <ClientFiltersBar
            value={clientFilters}
            onChange={(v: ClientFilters) => {
              setClientPage(1);
              setClientFilters(v);
            }}
            onNew={() => {
              setEditingClient(null);
              setClientModalOpen(true);
            }}
          />

          <ClientTable
            data={clients}
            loading={clientsQ.isLoading}
            onEdit={(id: string) => {
              const c = clients.find((x) => x.id === id) || null;
              setEditingClient(c);
              setClientModalOpen(true);
            }}
            onDelete={(id: string) => {
              // deixa seu handler atual (se existir) ou só placeholder por enquanto
              alert(`Excluir cliente: ${id}`);
            }}
          />

          <ClientFormModal
            open={clientModalOpen}
            onClose={() => setClientModalOpen(false)}
            initial={editingClient}
            title={editingClient ? "Editar Cliente" : "Novo Cliente"}
            onSubmit={async (data: ClientFormData) => {
              // mantém seu fluxo atual do modal existente (ele já deve chamar create/update)
              // Se o modal atual só entrega dados, você integra aqui.
              console.log("Client submit", data);
              setClientModalOpen(false);
            }}
          />
        </>
      ) : (
        <>
          <DriverFiltersBar
            value={driverFilters}
            onChange={(v) => {
              setDriverPage(1);
              setDriverFilters(v);
            }}
            onNew={() => {
              setEditingDriver(null);
              setDriverModalOpen(true);
            }}
            companies={pjCompanies}
          />

          <DriverTable
            rows={drivers}
            loading={driversQ.isLoading}
            onEdit={(id) => {
              const d = drivers.find((x) => x.id === id) || null;
              setEditingDriver(d);
              setDriverModalOpen(true);
            }}
            onDelete={(id) => deleteDriverM.mutate(id)}
            onMigrate={(d) => {
              setSelectedDriverForMigrate(d);
              setMigrateOpen(true);
            }}
          />

          <DriverFormModal
            open={driverModalOpen}
            mode={editingDriver ? "edit" : "create"}
            initial={editingDriver}
            companies={pjCompanies}
            onClose={() => {
              setDriverModalOpen(false);
              setEditingDriver(null);
            }}
            onSubmit={async (args) => {
              // Regra: clientId não troca via update → migração
              if (!args) return;

              if (!editingDriver) {
                // create
                await createDriverM.mutateAsync(args as CreateDriverPayload);
                return;
              }

              // edit normal (sem migração)
              await updateDriverM.mutateAsync({
                id: editingDriver.id,
                payload: args as UpdateDriverPayload,
              });
            }}
          />

          <MigrateDriverModal
            open={migrateOpen}
            driver={selectedDriverForMigrate}
            companies={pjCompanies}
            onClose={() => {
              setMigrateOpen(false);
              setSelectedDriverForMigrate(null);
            }}
            onConfirm={(args) => migrateDriverM.mutate(args)}
          />
        </>
      )}
    </div>
  );
}
