$ErrorActionPreference = "Stop"

function WriteUtf8NoBom([string]$Path, [string]$Content) {
  $dir = Split-Path -Parent $Path
  if ($dir -and !(Test-Path $dir)) { New-Item -ItemType Directory -Force -Path $dir | Out-Null }
  $full = Join-Path (Get-Location) $Path
  $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
  [System.IO.File]::WriteAllText($full, $Content, $utf8NoBom)
  Write-Host "✅ write: $Path" -ForegroundColor Green
}

Write-Host "
🚀 PATCH DEFINITIVO WEB — API URL + RHF+Zod (modal clientes)
" -ForegroundColor Cyan

# 1) helper HTTP
WriteUtf8NoBom "apps/web/src/lib/api/http.ts" @'
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const url = path.startsWith('http') ? path : API_URL + path

  const res = await fetch(url, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
    cache: 'no-store',
  })

  if (!res.ok) {
    let msg = 'Erro na requisição'
    try {
      const body: any = await res.json()
      msg = body?.message || body?.error || msg
    } catch {}
    throw new Error(msg)
  }

  return res.json() as Promise<T>
}
'@

# 2) client api
WriteUtf8NoBom "apps/web/src/lib/api/clients.ts" @'
import { api } from './http'

export type ClientFilters = {
  search?: string
  type?: 'PF' | 'PJ' | 'ALL'
  status?: 'ATIVO' | 'INATIVO' | 'BLOQUEADO' | 'ALL'
}

type ListResponse<T> = {
  ok: boolean
  data: T[]
  meta: { total: number; page: number; limit: number; pages: number }
}

export async function getClients(filters: ClientFilters, page = 1, limit = 10) {
  const qs = new URLSearchParams()
  if (filters.search) qs.set('search', filters.search)
  if (filters.type && filters.type !== 'ALL') qs.set('type', filters.type)
  if (filters.status && filters.status !== 'ALL') qs.set('status', filters.status)
  qs.set('page', String(page))
  qs.set('limit', String(limit))

  return api<ListResponse<any>>(/clients?)
}

export async function createClient(payload: any) {
  return api<any>(/clients, { method: 'POST', body: JSON.stringify(payload) })
}

export async function updateClient(id: string, payload: any) {
  return api<any>(/clients/, { method: 'PATCH', body: JSON.stringify(payload) })
}

export async function deleteClient(id: string) {
  return api<any>(/clients/, { method: 'DELETE' })
}
'@

# 3) modal RHF + Zod
WriteUtf8NoBom "apps/web/src/app/(app)/clientes/_components/client-form-modal.tsx" @'
'use client'

import { useEffect, useMemo } from 'react'
import { X } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { createClient, updateClient } from '@/lib/api/clients'

const schemaPF = z.object({
  type: z.literal('PF'),
  name: z.string().min(2, 'Nome obrigatório'),
  cpf: z.string().min(11, 'CPF obrigatório'),
  cellphone: z.string().optional(),
  email: z.string().email('E-mail inválido').optional().or(z.literal('')),
  status: z.enum(['ATIVO', 'INATIVO', 'BLOQUEADO']).default('ATIVO'),
})

const schemaPJ = z.object({
  type: z.literal('PJ'),
  razaoSocial: z.string().min(2, 'Razão Social obrigatória'),
  nomeFantasia: z.string().optional(),
  cnpj: z.string().min(14, 'CNPJ obrigatório'),
  cellphone: z.string().optional(),
  email: z.string().email('E-mail inválido').optional().or(z.literal('')),
  status: z.enum(['ATIVO', 'INATIVO', 'BLOQUEADO']).default('ATIVO'),
})

const schema = z.discriminatedUnion('type', [schemaPF, schemaPJ])
type FormData = z.infer<typeof schema>

interface Props {
  isOpen: boolean
  onClose: () => void
  mode: 'create' | 'edit'
  clientId?: string
}

export function ClientFormModal({ isOpen, onClose, mode, clientId }: Props) {
  const qc = useQueryClient()

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { type: 'PF', status: 'ATIVO' } as any,
    mode: 'onChange',
  })

  const type = form.watch('type')

  useEffect(() => {
    if (!isOpen) form.reset({ type: 'PF', status: 'ATIVO' } as any)
  }, [isOpen]) // eslint-disable-line react-hooks/exhaustive-deps

  const mutation = useMutation({
    mutationFn: async (values: FormData) => {
      if (mode === 'edit' && clientId) return updateClient(clientId, values)
      return createClient(values)
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['clients'] })
      onClose()
    },
  })

  const title = useMemo(
    () => (mode === 'create' ? '➕ Novo Cliente' : '✏️ Editar Cliente'),
    [mode]
  )

  if (!isOpen) return null

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto'>
      <div className='w-full max-w-4xl rounded-lg bg-white shadow-xl my-8'>
        <div className='flex items-center justify-between border-b p-4'>
          <div className='space-y-0.5'>
            <h3 className='text-lg font-semibold text-gray-900'>{title}</h3>
            {mode === 'edit' ? <p className='text-xs text-gray-500'>ID: {clientId}</p> : null}
          </div>

          <button onClick={onClose} className='rounded p-1 hover:bg-gray-100'>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={form.handleSubmit((v) => mutation.mutate(v))} className='p-6 space-y-4'>
          <div className='grid grid-cols-1 gap-3 md:grid-cols-3'>
            <div>
              <label className='text-sm font-medium text-gray-700'>Tipo</label>
              <select
                className='mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm'
                value={type}
                onChange={(e) => form.setValue('type', e.target.value as any)}
              >
                <option value='PF'>Pessoa Física</option>
                <option value='PJ'>Pessoa Jurídica</option>
              </select>
            </div>

            <div>
              <label className='text-sm font-medium text-gray-700'>Status</label>
              <select
                className='mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm'
                {...form.register('status' as any)}
              >
                <option value='ATIVO'>Ativo</option>
                <option value='INATIVO'>Inativo</option>
                <option value='BLOQUEADO'>Bloqueado</option>
              </select>
            </div>

            <div>
              <label className='text-sm font-medium text-gray-700'>Telefone</label>
              <input
                className='mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm'
                placeholder='(31) 99999-9999'
                {...form.register('cellphone' as any)}
              />
            </div>
          </div>

          {type === 'PF' ? (
            <div className='grid grid-cols-1 gap-3 md:grid-cols-3'>
              <div className='md:col-span-2'>
                <label className='text-sm font-medium text-gray-700'>Nome</label>
                <input className='mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm' {...form.register('name' as any)} />
                {form.formState.errors?.['name' as any]?.message ? (
                  <p className='mt-1 text-xs text-red-600'>{String(form.formState.errors['name' as any]?.message)}</p>
                ) : null}
              </div>
              <div>
                <label className='text-sm font-medium text-gray-700'>CPF</label>
                <input className='mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm' {...form.register('cpf' as any)} />
                {form.formState.errors?.['cpf' as any]?.message ? (
                  <p className='mt-1 text-xs text-red-600'>{String(form.formState.errors['cpf' as any]?.message)}</p>
                ) : null}
              </div>
            </div>
          ) : (
            <div className='grid grid-cols-1 gap-3 md:grid-cols-3'>
              <div className='md:col-span-2'>
                <label className='text-sm font-medium text-gray-700'>Razão Social</label>
                <input className='mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm' {...form.register('razaoSocial' as any)} />
                {form.formState.errors?.['razaoSocial' as any]?.message ? (
                  <p className='mt-1 text-xs text-red-600'>{String(form.formState.errors['razaoSocial' as any]?.message)}</p>
                ) : null}
              </div>
              <div>
                <label className='text-sm font-medium text-gray-700'>CNPJ</label>
                <input className='mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm' {...form.register('cnpj' as any)} />
                {form.formState.errors?.['cnpj' as any]?.message ? (
                  <p className='mt-1 text-xs text-red-600'>{String(form.formState.errors['cnpj' as any]?.message)}</p>
                ) : null}
              </div>

              <div className='md:col-span-3'>
                <label className='text-sm font-medium text-gray-700'>Nome Fantasia</label>
                <input className='mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm' {...form.register('nomeFantasia' as any)} />
              </div>
            </div>
          )}

          <div className='grid grid-cols-1 gap-3 md:grid-cols-3'>
            <div className='md:col-span-2'>
              <label className='text-sm font-medium text-gray-700'>E-mail</label>
              <input className='mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm' {...form.register('email' as any)} />
              {form.formState.errors?.['email' as any]?.message ? (
                <p className='mt-1 text-xs text-red-600'>{String(form.formState.errors['email' as any]?.message)}</p>
              ) : null}
            </div>

            <div className='flex items-end justify-end gap-3'>
              <button type='button' onClick={onClose} className='rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-700 hover:bg-gray-50'>
                Cancelar
              </button>
              <button
                type='submit'
                disabled={mutation.isPending || !form.formState.isValid}
                className='rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50'
              >
                {mutation.isPending ? 'Salvando...' : mode === 'create' ? 'Criar' : 'Salvar'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
'@

Write-Host "
✅ Patch WEB aplicado com sucesso.
" -ForegroundColor Green
