# MAG System - Auto Fix (PowerShell 5.1 SAFE)
# Objetivo:
# - Evitar PowerShell quebrar template strings do TS/TSX
# - Gravar arquivos em UTF-8 sem BOM + CRLF
# - Criar API clients module básico
# - Criar WEB http.ts + clients.ts tipados
# - Recriar Modal + Table + page.tsx (sem unknown[], sem any explícito)
# - Rodar install + typecheck + lint --fix + build

$ErrorActionPreference = "Stop"
$WarningPreference = "SilentlyContinue"

function Step([string]$msg) { Write-Host "`n==> $msg" -ForegroundColor Cyan }
function Ok([string]$msg)   { Write-Host "[OK] $msg" -ForegroundColor Green }
function Warn([string]$msg) { Write-Host "[WARN] $msg" -ForegroundColor Yellow }
function Fail([string]$msg) { Write-Host "[ERRO] $msg" -ForegroundColor Red; throw $msg }

function Assert-RepoRoot([string]$repo) {
  if (-not (Test-Path (Join-Path $repo "pnpm-workspace.yaml"))) {
    Fail "Execute na raiz do monorepo (onde existe pnpm-workspace.yaml). Atual: $repo"
  }
}

function Ensure-Dir([string]$path) {
  $dir = Split-Path $path -Parent
  if ($dir -and -not (Test-Path $dir)) {
    New-Item -ItemType Directory -Force -Path $dir | Out-Null
  }
}

# UTF-8 sem BOM + CRLF
function Write-FileCRLF([string]$path, [string]$content) {
  Ensure-Dir $path
  $c = $content -replace "`r`n", "`n"
  $c = $c -replace "`n", "`r`n"
  if (-not $c.EndsWith("`r`n")) { $c = $c + "`r`n" }
  [System.IO.File]::WriteAllText($path, $c, (New-Object System.Text.UTF8Encoding($false)))
  Ok ("Gravado: " + $path)
}

function Kill-Port([int]$port) {
  try {
    Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue |
      ForEach-Object {
        if ($_.OwningProcess -and $_.OwningProcess -gt 0) {
          Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue
        }
      }
  } catch {}
}

function Run([string]$cmd, [string]$cwd = $null) {
  $old = Get-Location
  try {
    if ($cwd) { Set-Location $cwd }
    Write-Host ">> $cmd" -ForegroundColor DarkGray
    & cmd.exe /c $cmd
    if ($LASTEXITCODE -ne 0) { Fail "Falhou: $cmd (exit $LASTEXITCODE)" }
  } finally {
    Set-Location $old
  }
}

# -----------------------------------------------------------------------------

$repo = (Resolve-Path ".").Path
Assert-RepoRoot $repo

$apiRoot = Join-Path $repo "apps\api"
$webRoot = Join-Path $repo "apps\web"

if (-not (Test-Path $apiRoot)) { Fail "Nao encontrado: apps/api" }
if (-not (Test-Path $webRoot)) { Fail "Nao encontrado: apps/web" }

Step "1) Limpar locks/caches + matar portas"
Kill-Port 3000
Kill-Port 3001
Kill-Port 3002
Remove-Item (Join-Path $webRoot ".next\dev\lock") -Force -ErrorAction SilentlyContinue
Remove-Item (Join-Path $webRoot ".next") -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item (Join-Path $apiRoot "dist") -Recurse -Force -ErrorAction SilentlyContinue
Ok "Portas e caches limpos"

# -----------------------------------------------------------------------------
Step "2) API: ClientsModule + AppModule"
$clientsDir = Join-Path $apiRoot "src\clients"
New-Item -ItemType Directory -Force -Path $clientsDir | Out-Null

Write-FileCRLF (Join-Path $clientsDir "clients.module.ts") @'
import { Module } from '@nestjs/common';
import { ClientsController } from './clients.controller';
import { ClientsService } from './clients.service';

@Module({
  controllers: [ClientsController],
  providers: [ClientsService],
})
export class ClientsModule {}
'@

Write-FileCRLF (Join-Path $clientsDir "clients.controller.ts") @'
import { Controller, Get, Query } from '@nestjs/common';
import { ClientsService } from './clients.service';

@Controller('clients')
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Get()
  async findAll(
    @Query('page') page = '1',
    @Query('limit') limit = '10',
    @Query('search') search?: string,
    @Query('type') type?: string,
    @Query('status') status?: string,
  ) {
    return this.clientsService.findAll({
      page: Number(page) || 1,
      limit: Number(limit) || 10,
      search,
      type,
      status,
    });
  }
}
'@

Write-FileCRLF (Join-Path $clientsDir "clients.service.ts") @'
import { Injectable } from '@nestjs/common';

type ListParams = {
  page: number;
  limit: number;
  search?: string;
  type?: string;
  status?: string;
};

type ListResponse<T> = {
  ok: boolean;
  data: T[];
  meta: { total: number; page: number; limit: number; pages: number };
};

@Injectable()
export class ClientsService {
  async findAll(params: ListParams): Promise<ListResponse<unknown>> {
    return {
      ok: true,
      data: [],
      meta: {
        total: 0,
        page: params.page,
        limit: params.limit,
        pages: 0,
      },
    };
  }
}
'@

Write-FileCRLF (Join-Path $apiRoot "src\app.module.ts") @'
import { Module } from '@nestjs/common';
import { ClientsModule } from './clients/clients.module';

@Module({
  imports: [ClientsModule],
})
export class AppModule {}
'@

Ok "API criada/atualizada"

# -----------------------------------------------------------------------------
Step "3) WEB: http.ts + clients.ts (sem PowerShell quebrar `${}`)"
New-Item -ItemType Directory -Force -Path (Join-Path $webRoot "src\lib\api") | Out-Null

Write-FileCRLF (Join-Path $webRoot "src\lib\api\http.ts") @'
type ApiError = {
  ok: false;
  status: number;
  code?: string;
  message?: string;
  details?: unknown;
};

function getBaseUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_API_URL;
  return envUrl && envUrl.trim() ? envUrl.trim() : 'http://localhost:3001';
}

async function parseBody(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const baseUrl = getBaseUrl();
  const url = `${baseUrl}${path}`;

  const res = await fetch(url, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  });

  if (res.status === 204) return undefined as unknown as T;

  const data = await parseBody(res);

  if (!res.ok) {
    const msg =
      typeof data === 'object' &&
      data &&
      'message' in (data as Record<string, unknown>)
        ? String((data as Record<string, unknown>)['message'])
        : `HTTP ${res.status}`;

    const err: ApiError = {
      ok: false,
      status: res.status,
      message: msg,
      details: data,
    };
    throw err;
  }

  return data as T;
}
'@

Write-FileCRLF (Join-Path $webRoot "src\lib\api\clients.ts") @'
import { api } from './http';

export type ClientStatus = 'ATIVO' | 'INATIVO' | 'BLOQUEADO';
export type ClientType = 'PF' | 'PJ';

export type Client = {
  id: string;
  type: ClientType;
  status: ClientStatus;
  name?: string;
  razaoSocial?: string;
  nomeFantasia?: string;
  cpf?: string;
  cnpj?: string;
  cellphone?: string;
  email?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type ClientFilters = {
  search?: string;
  type?: ClientType | 'ALL';
  status?: ClientStatus | 'ALL';
};

export type ListResponse<T> = {
  ok: boolean;
  data: T[];
  meta: { total: number; page: number; limit: number; pages: number };
};

export async function getClients(filters: ClientFilters, page = 1, limit = 10) {
  const qs = new URLSearchParams();
  if (filters.search) qs.set('search', filters.search);
  if (filters.type && filters.type !== 'ALL') qs.set('type', filters.type);
  if (filters.status && filters.status !== 'ALL') qs.set('status', filters.status);
  qs.set('page', String(page));
  qs.set('limit', String(limit));
  return api<ListResponse<Client>>(`/clients?${qs.toString()}`);
}

export async function createClient(payload: unknown) {
  return api<Client>('/clients', { method: 'POST', body: JSON.stringify(payload) });
}

export async function updateClient(id: string, payload: unknown) {
  return api<Client>(`/clients/${id}`, { method: 'PATCH', body: JSON.stringify(payload) });
}

export async function deleteClient(id: string) {
  return api<{ ok: boolean }>(`/clients/${id}`, { method: 'DELETE' });
}
'@

Ok "WEB API client tipado criado"

# -----------------------------------------------------------------------------
Step "4) WEB: ClientFormModal (open/onClose)"
$modalPath = Join-Path $webRoot "src\app\(app)\clientes\_components\client-form-modal.tsx"
Write-FileCRLF $modalPath @'
'use client';

import * as React from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import type { Client } from '@/lib/api/clients';

const StatusEnum = z.enum(['ATIVO', 'INATIVO', 'BLOQUEADO']);

const schema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('PF'),
    status: StatusEnum,
    name: z.string().min(2, 'Nome obrigatório'),
    cpf: z.string().min(11, 'CPF obrigatório'),
    cellphone: z.string().optional(),
    email: z.string().email('E-mail inválido').optional().or(z.literal('')),
  }),
  z.object({
    type: z.literal('PJ'),
    status: StatusEnum,
    razaoSocial: z.string().min(2, 'Razão Social obrigatória'),
    cnpj: z.string().min(14, 'CNPJ obrigatório'),
    nomeFantasia: z.string().optional(),
    cellphone: z.string().optional(),
    email: z.string().email('E-mail inválido').optional().or(z.literal('')),
  }),
]);

export type ClientFormData = z.infer<typeof schema>;

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: ClientFormData) => Promise<void> | void;
  initial?: Client | null;
  title?: string;
};

type ErrorMap = Partial<Record<string, { message?: string }>>;

const DEFAULTS: ClientFormData = {
  type: 'PF',
  status: 'ATIVO',
  name: '',
  cpf: '',
};

export function ClientFormModal({ open, onClose, onSubmit, initial, title }: Props) {
  const form = useForm<ClientFormData>({
    resolver: zodResolver(schema),
    mode: 'onChange',
    defaultValues: DEFAULTS,
  });

  React.useEffect(() => {
    if (!open) return;

    if (!initial) {
      form.reset(DEFAULTS);
      return;
    }

    if (initial.type === 'PF') {
      form.reset({
        type: 'PF',
        status: initial.status,
        name: initial.name ?? '',
        cpf: initial.cpf ?? '',
        cellphone: initial.cellphone ?? '',
        email: initial.email ?? '',
      });
    } else {
      form.reset({
        type: 'PJ',
        status: initial.status,
        razaoSocial: initial.razaoSocial ?? '',
        cnpj: initial.cnpj ?? '',
        nomeFantasia: initial.nomeFantasia ?? '',
        cellphone: initial.cellphone ?? '',
        email: initial.email ?? '',
      });
    }
  }, [open, initial, form]);

  if (!open) return null;

  const type = form.watch('type');
  const errors = form.formState.errors as unknown as ErrorMap;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-xl rounded-xl bg-white p-6 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">{title ?? (initial ? 'Editar Cliente' : 'Novo Cliente')}</h2>
          <button className="rounded px-2 py-1 text-sm hover:bg-gray-100" onClick={onClose}>
            X
          </button>
        </div>

        <form
          onSubmit={form.handleSubmit(async (data) => {
            await onSubmit(data);
          })}
          className="space-y-4"
        >
          <div className="grid grid-cols-2 gap-4">
            <label className="text-sm">
              <div className="mb-1 font-medium text-gray-700">Tipo</div>
              <select className="w-full rounded border border-gray-300 p-2" {...form.register('type')}>
                <option value="PF">Pessoa Física</option>
                <option value="PJ">Pessoa Jurídica</option>
              </select>
            </label>

            <label className="text-sm">
              <div className="mb-1 font-medium text-gray-700">Status</div>
              <select className="w-full rounded border border-gray-300 p-2" {...form.register('status')}>
                <option value="ATIVO">Ativo</option>
                <option value="INATIVO">Inativo</option>
                <option value="BLOQUEADO">Bloqueado</option>
              </select>
            </label>
          </div>

          {type === 'PF' ? (
            <div className="grid grid-cols-2 gap-4">
              <label className="col-span-2 text-sm">
                <div className="mb-1 font-medium text-gray-700">Nome</div>
                <input className="w-full rounded border border-gray-300 p-2" {...form.register('name')} />
                {errors.name?.message ? <p className="mt-1 text-xs text-red-500">{errors.name.message}</p> : null}
              </label>

              <label className="text-sm">
                <div className="mb-1 font-medium text-gray-700">CPF</div>
                <input className="w-full rounded border border-gray-300 p-2" {...form.register('cpf')} />
                {errors.cpf?.message ? <p className="mt-1 text-xs text-red-500">{errors.cpf.message}</p> : null}
              </label>

              <label className="text-sm">
                <div className="mb-1 font-medium text-gray-700">Celular</div>
                <input className="w-full rounded border border-gray-300 p-2" {...form.register('cellphone')} />
              </label>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <label className="col-span-2 text-sm">
                <div className="mb-1 font-medium text-gray-700">Razão Social</div>
                <input className="w-full rounded border border-gray-300 p-2" {...form.register('razaoSocial')} />
                {errors.razaoSocial?.message ? (
                  <p className="mt-1 text-xs text-red-500">{errors.razaoSocial.message}</p>
                ) : null}
              </label>

              <label className="text-sm">
                <div className="mb-1 font-medium text-gray-700">CNPJ</div>
                <input className="w-full rounded border border-gray-300 p-2" {...form.register('cnpj')} />
                {errors.cnpj?.message ? <p className="mt-1 text-xs text-red-500">{errors.cnpj.message}</p> : null}
              </label>

              <label className="text-sm">
                <div className="mb-1 font-medium text-gray-700">Nome Fantasia</div>
                <input className="w-full rounded border border-gray-300 p-2" {...form.register('nomeFantasia')} />
              </label>
            </div>
          )}

          <label className="text-sm">
            <div className="mb-1 font-medium text-gray-700">E-mail</div>
            <input className="w-full rounded border border-gray-300 p-2" {...form.register('email')} />
            {errors.email?.message ? <p className="mt-1 text-xs text-red-500">{errors.email.message}</p> : null}
          </label>

          <div className="flex justify-end gap-3 pt-4">
            <button type="button" className="rounded border border-gray-300 px-4 py-2 hover:bg-gray-50" onClick={onClose}>
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!form.formState.isValid}
              className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {initial ? 'Salvar' : 'Criar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
'@

Ok "Modal criado"

# -----------------------------------------------------------------------------
Step "5) WEB: ClientTable tipado"
$tablePath = Join-Path $webRoot "src\app\(app)\clientes\_components\client-table.tsx"
Write-FileCRLF $tablePath @'
'use client';

import * as React from 'react';
import type { Client } from '@/lib/api/clients';

type Props = {
  items: Client[];
  onEdit: (c: Client) => void;
  onDelete: (c: Client) => void;
};

function labelName(c: Client) {
  return c.type === 'PF' ? (c.name ?? '-') : (c.razaoSocial ?? '-');
}

function labelDoc(c: Client) {
  return c.type === 'PF' ? (c.cpf ?? '-') : (c.cnpj ?? '-');
}

export function ClientTable({ items, onEdit, onDelete }: Props) {
  return (
    <div className="overflow-x-auto rounded-xl border bg-white">
      <table className="min-w-full text-sm">
        <thead className="border-b bg-gray-50">
          <tr>
            <th className="px-3 py-2 text-left font-medium text-gray-700">Nome</th>
            <th className="px-3 py-2 text-left font-medium text-gray-700">CPF/CNPJ</th>
            <th className="px-3 py-2 text-left font-medium text-gray-700">Telefone</th>
            <th className="px-3 py-2 text-left font-medium text-gray-700">Status</th>
            <th className="px-3 py-2 text-right font-medium text-gray-700">Acoes</th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 ? (
            <tr>
              <td className="px-3 py-6 text-center text-gray-500" colSpan={5}>
                Nenhum cliente encontrado.
              </td>
            </tr>
          ) : (
            items.map((c) => (
              <tr key={c.id} className="border-b last:border-0">
                <td className="px-3 py-2">{labelName(c)}</td>
                <td className="px-3 py-2">{labelDoc(c)}</td>
                <td className="px-3 py-2">{c.cellphone ?? '-'}</td>
                <td className="px-3 py-2">{c.status}</td>
                <td className="px-3 py-2 text-right">
                  <div className="flex justify-end gap-2">
                    <button className="rounded border px-2 py-1 hover:bg-gray-50" onClick={() => onEdit(c)}>
                      Editar
                    </button>
                    <button className="rounded border px-2 py-1 hover:bg-gray-50" onClick={() => onDelete(c)}>
                      Excluir
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
'@

Ok "Tabela criada"

# -----------------------------------------------------------------------------
Step "6) WEB: clientes/page.tsx (zera unknown[] e corrige open/isOpen)"
$pagePath = Join-Path $webRoot "src\app\(app)\clientes\page.tsx"
Write-FileCRLF $pagePath @'
'use client';

import * as React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ClientFormModal, type ClientFormData } from './_components/client-form-modal';
import { ClientTable } from './_components/client-table';
import {
  getClients,
  createClient,
  updateClient,
  deleteClient,
  type Client,
  type ClientFilters,
  type ListResponse,
} from '@/lib/api/clients';

function toPayload(v: ClientFormData): Record<string, unknown> {
  if (v.type === 'PF') {
    return {
      type: 'PF',
      status: v.status,
      name: v.name,
      cpf: v.cpf,
      cellphone: v.cellphone ?? '',
      email: v.email ?? '',
    };
  }
  return {
    type: 'PJ',
    status: v.status,
    razaoSocial: v.razaoSocial,
    cnpj: v.cnpj,
    nomeFantasia: v.nomeFantasia ?? '',
    cellphone: v.cellphone ?? '',
    email: v.email ?? '',
  };
}

export default function ClientesPage() {
  const qc = useQueryClient();

  const [filters, setFilters] = React.useState<ClientFilters>({ type: 'ALL', status: 'ALL', search: '' });
  const [page, setPage] = React.useState<number>(1);

  const [open, setOpen] = React.useState<boolean>(false);
  const [editing, setEditing] = React.useState<Client | null>(null);

  const q = useQuery<ListResponse<Client>>({
    queryKey: ['clients', filters, page],
    queryFn: () => getClients(filters, page, 10),
    staleTime: 10_000,
  });

  const createMut = useMutation({
    mutationFn: async (data: ClientFormData) => createClient(toPayload(data)),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['clients'] });
    },
  });

  const updateMut = useMutation({
    mutationFn: async (args: { id: string; data: ClientFormData }) => updateClient(args.id, toPayload(args.data)),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['clients'] });
    },
  });

  const deleteMut = useMutation({
    mutationFn: async (id: string) => deleteClient(id),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['clients'] });
    },
  });

  const items = q.data?.data ?? [];

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-xl font-semibold">Clientes</h1>
          <p className="text-sm text-gray-500">Cadastro e gestao de clientes PF/PJ</p>
        </div>

        <button
          className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
          onClick={() => {
            setEditing(null);
            setOpen(true);
          }}
        >
          + Novo Cliente
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
        <input
          className="rounded-lg border px-3 py-2 text-sm md:col-span-2"
          placeholder="Buscar por nome, CPF/CNPJ..."
          value={filters.search ?? ''}
          onChange={(e) => {
            setPage(1);
            setFilters((f) => ({ ...f, search: e.target.value }));
          }}
        />

        <select
          className="rounded-lg border px-3 py-2 text-sm"
          value={filters.type ?? 'ALL'}
          onChange={(e) => {
            setPage(1);
            setFilters((f) => ({ ...f, type: e.target.value as ClientFilters['type'] }));
          }}
        >
          <option value="ALL">Tipo: Todos</option>
          <option value="PF">Pessoa Fisica</option>
          <option value="PJ">Pessoa Juridica</option>
        </select>

        <select
          className="rounded-lg border px-3 py-2 text-sm"
          value={filters.status ?? 'ALL'}
          onChange={(e) => {
            setPage(1);
            setFilters((f) => ({ ...f, status: e.target.value as ClientFilters['status'] }));
          }}
        >
          <option value="ALL">Status: Todos</option>
          <option value="ATIVO">Ativo</option>
          <option value="INATIVO">Inativo</option>
          <option value="BLOQUEADO">Bloqueado</option>
        </select>
      </div>

      {q.isError ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          Erro ao carregar clientes.
        </div>
      ) : null}

      <ClientTable
        items={items}
        onEdit={(c) => {
          setEditing(c);
          setOpen(true);
        }}
        onDelete={(c) => {
          if (confirm('Excluir este cliente?')) {
            deleteMut.mutate(c.id);
          }
        }}
      />

      <div className="flex items-center justify-between text-sm text-gray-600">
        <button className="rounded border px-3 py-1 disabled:opacity-50" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
          Anterior
        </button>
        <span>Pagina {page}</span>
        <button
          className="rounded border px-3 py-1 disabled:opacity-50"
          disabled={!q.data?.meta || page >= (q.data.meta.pages || page)}
          onClick={() => setPage((p) => p + 1)}
        >
          Proxima
        </button>
      </div>

      <ClientFormModal
        open={open}
        onClose={() => setOpen(false)}
        initial={editing}
        title={editing ? 'Editar Cliente' : 'Novo Cliente'}
        onSubmit={async (data) => {
          if (editing) {
            await updateMut.mutateAsync({ id: editing.id, data });
          } else {
            await createMut.mutateAsync(data);
          }
          setOpen(false);
        }}
      />
    </div>
  );
}
'@

Ok "Page criada"

# -----------------------------------------------------------------------------
Step "7) pnpm install (frozen lockfile)"
Run "corepack pnpm install --frozen-lockfile"

Step "8) typecheck"
Run "corepack pnpm -w typecheck"

Step "9) lint --fix"
Run "corepack pnpm -r lint -- --fix"

Step "10) build"
Run "corepack pnpm -w build"

Ok "Script finalizado"
