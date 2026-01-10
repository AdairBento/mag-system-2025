$ErrorActionPreference = "Stop"

function WriteUtf8NoBom([string]$Path, [string]$Content) {
  $dir = Split-Path -Parent $Path
  if ($dir -and !(Test-Path $dir)) { New-Item -ItemType Directory -Force -Path $dir | Out-Null }

  $full = Join-Path (Get-Location) $Path
  $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
  [System.IO.File]::WriteAllText($full, $Content, $utf8NoBom)
  Write-Host "✅ write: $Path (utf8 no BOM)" -ForegroundColor Green
}

Write-Host "
🚀 PATCH BASE — QueryProvider + App Layout
" -ForegroundColor Cyan

WriteUtf8NoBom "apps/web/src/components/providers/query-provider.tsx" @'
'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: 1,
            refetchOnWindowFocus: false,
            staleTime: 15000,
          },
        },
      })
  )

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}
'@

WriteUtf8NoBom "apps/web/src/app/(app)/layout.tsx" @'
import type { ReactNode } from 'react'

import { AppShell } from '@/components/shell/app-shell'
import { QueryProvider } from '@/components/providers/query-provider'

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <QueryProvider>
      <AppShell>{children}</AppShell>
    </QueryProvider>
  )
}
'@

Write-Host "
✅ Patch base aplicado com sucesso.
" -ForegroundColor Green
