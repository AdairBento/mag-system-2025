# scripts/setup-governance-logger.ps1
# Run from repo root:
# powershell -ExecutionPolicy Bypass -File .\scripts\setup-governance-logger.ps1

$ErrorActionPreference = "Stop"

function Ensure-RepoRoot {
  if (!(Test-Path ".\pnpm-workspace.yaml")) {
    throw "Rode este script na RAIZ do monorepo (onde existe pnpm-workspace.yaml)."
  }
}

function Ensure-Dir([string]$path) {
  if (!(Test-Path $path)) { New-Item -ItemType Directory -Force -Path $path | Out-Null }
}

function Write-Utf8NoBom([string]$path, [string]$content) {
  $utf8 = New-Object System.Text.UTF8Encoding $false
  $fullPath = Join-Path (Get-Location) $path
  $dir = Split-Path $fullPath -Parent
  if (!(Test-Path $dir)) { New-Item -ItemType Directory -Force -Path $dir | Out-Null }
  [System.IO.File]::WriteAllText($fullPath, $content, $utf8)
}

function Backup-File([string]$path) {
  if (Test-Path $path) {
    $ts = Get-Date -Format "yyyyMMdd-HHmmss"
    Copy-Item -Force $path "$path.bak.$ts"
  }
}

function Json-Read([string]$path) {
  if (!(Test-Path $path)) { throw "JSON não encontrado: $path" }
  return Get-Content $path -Raw | ConvertFrom-Json
}

function Json-Write([string]$path, $obj) {
  $json = $obj | ConvertTo-Json -Depth 60
  Write-Utf8NoBom $path ($json + "`r`n")
}

function Ensure-Root-PackageScripts {
  $p = ".\package.json"
  if (!(Test-Path $p)) { throw "Não achei package.json na raiz." }
  Backup-File $p

  $obj = Json-Read $p
  if ($null -eq $obj.scripts) { $obj | Add-Member -NotePropertyName scripts -NotePropertyValue (@{}) }

  $obj.scripts.dev         = "pnpm -r --parallel dev"
  $obj.scripts."dev:web"   = "pnpm --filter @mag/web dev"
  $obj.scripts."dev:api"   = "pnpm --filter @mag/api start:dev"
  $obj.scripts.build       = "pnpm -r build"
  $obj.scripts.lint        = "pnpm -r lint"
  $obj.scripts."lint:fix"  = "pnpm -r lint -- --fix"
  $obj.scripts.typecheck   = "pnpm -r typecheck"
  $obj.scripts.format      = "prettier -w ."
  $obj.scripts."format:check" = "prettier -c ."
  $obj.scripts.prepare     = "husky"

  Json-Write $p $obj
}

function Write-Governance-Files {
  Write-Host "`n🧩 Criando configs de governança (eslint/prettier/commitlint)..." -ForegroundColor Cyan

  Backup-File ".\.editorconfig"
  Write-Utf8NoBom ".\.editorconfig" @'
root = true

[*]
charset = utf-8
end_of_line = crlf
insert_final_newline = true
indent_style = space
indent_size = 2
trim_trailing_whitespace = true

[*.md]
trim_trailing_whitespace = false
'@

  Backup-File ".\.prettierrc.json"
  Write-Utf8NoBom ".\.prettierrc.json" @'
{
  "semi": true,
  "singleQuote": false,
  "printWidth": 100,
  "trailingComma": "all"
}
'@

  Backup-File ".\.prettierignore"
  Write-Utf8NoBom ".\.prettierignore" @'
node_modules
.next
dist
build
coverage
pnpm-lock.yaml
**/*.bak.*
'@

  Backup-File ".\.eslintrc.cjs"
  Write-Utf8NoBom ".\.eslintrc.cjs" @'
/** @type {import("eslint").Linter.Config} */
module.exports = {
  root: true,
  ignorePatterns: ["**/node_modules/**", "**/.next/**", "**/dist/**", "**/build/**"],
  parserOptions: { ecmaVersion: "latest", sourceType: "module" },
  plugins: ["@typescript-eslint", "import", "unused-imports"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:import/recommended",
    "plugin:import/typescript",
    "prettier"
  ],
  rules: {
    "no-console": "off",
    "@typescript-eslint/no-unused-vars": ["warn", { "argsIgnorePattern": "^_" }],
    "unused-imports/no-unused-imports": "error",
    "import/order": ["warn", {
      "groups": ["builtin", "external", "internal", "parent", "sibling", "index", "type"],
      "newlines-between": "always",
      "alphabetize": { "order": "asc", "caseInsensitive": true }
    }]
  },
  settings: {
    "import/resolver": {
      "typescript": true
    }
  }
};
'@

  Backup-File ".\commitlint.config.cjs"
  Write-Utf8NoBom ".\commitlint.config.cjs" @'
module.exports = {
  extends: ["@commitlint/config-conventional"],
};
'@

  Backup-File ".\lintstagedrc.json"
  Write-Utf8NoBom ".\lintstagedrc.json" @'
{
  "*.{ts,tsx,js,jsx,json,md,css}": ["prettier -w"],
  "*.{ts,tsx,js,jsx}": ["eslint --fix"]
}
'@

  Backup-File ".\README-CONVENTIONAL-COMMITS.md"
  Write-Utf8NoBom ".\README-CONVENTIONAL-COMMITS.md" @'
# Conventional Commits (padrão do MAG)

Exemplos:
- feat(auth): add login endpoint
- fix(web): handle empty state in dashboard
- chore(repo): configure husky and lint-staged
- refactor(api): split rentals module

Tipos comuns:
feat | fix | chore | docs | refactor | test | perf | build | ci
'@
}

function Install-Governance-Deps {
  Write-Host "`n📥 Instalando deps (eslint/prettier/husky/commitlint)..." -ForegroundColor Cyan

  & pnpm add -D `
    eslint `
    @typescript-eslint/parser `
    @typescript-eslint/eslint-plugin `
    eslint-plugin-import `
    eslint-import-resolver-typescript `
    eslint-plugin-unused-imports `
    prettier `
    husky `
    lint-staged `
    @commitlint/cli `
    @commitlint/config-conventional | Out-Host
}

function Ensure-Husky {
  Write-Host "`n🪝 Configurando Husky hooks..." -ForegroundColor Cyan

  # husky install
  & pnpm exec husky install | Out-Host

  Ensure-Dir ".\.husky"

  # pre-commit
  Backup-File ".\.husky\pre-commit"
  Write-Utf8NoBom ".\.husky\pre-commit" @'
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

pnpm exec lint-staged
'@

  # commit-msg
  Backup-File ".\.husky\commit-msg"
  Write-Utf8NoBom ".\.husky\commit-msg" @'
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

pnpm exec commitlint --edit "$1"
'@
}

function Ensure-App-Scripts-Typecheck {
  # Add "typecheck" script to apps if missing, without breaking existing scripts.
  foreach ($pkgPath in @(".\apps\web\package.json", ".\apps\api\package.json", ".\packages\shared\package.json", ".\packages\database\package.json")) {
    if (Test-Path $pkgPath) {
      $obj = Json-Read $pkgPath
      if ($null -eq $obj.scripts) { $obj | Add-Member -NotePropertyName scripts -NotePropertyValue (@{}) }

      if (-not $obj.scripts.typecheck) {
        # Next and Nest both support tsc, but Next uses "next lint" and TS compile.
        # We'll provide a safe generic tsc.
        $obj.scripts.typecheck = "tsc -p tsconfig.json --noEmit"
      }

      # Ensure lint exists (best effort)
      if (-not $obj.scripts.lint) {
        $obj.scripts.lint = "eslint ."
      }

      # Write back
      Backup-File $pkgPath
      Json-Write $pkgPath $obj
    }
  }
}

function Apply-Api-Pino-Logger {
  Write-Host "`n🧠 Aplicando logger estruturado (Pino) na API..." -ForegroundColor Cyan

  if (!(Test-Path ".\apps\api\src")) { throw "Não achei apps/api/src." }

  # install deps
  & pnpm --filter @mag/api add nestjs-pino pino-pretty | Out-Host

  # create logger module
  Ensure-Dir ".\apps\api\src\common\logger"
  Write-Utf8NoBom ".\apps\api\src\common\logger\logger.module.ts" @'
import { Module } from "@nestjs/common";
import { LoggerModule as PinoLoggerModule } from "nestjs-pino";

@Module({
  imports: [
    PinoLoggerModule.forRoot({
      pinoHttp: {
        transport: process.env.NODE_ENV !== "production"
          ? {
              target: "pino-pretty",
              options: { singleLine: true, translateTime: "SYS:standard" },
            }
          : undefined,
        customProps: (req) => ({
          requestId: (req as any).requestId,
        }),
      },
    }),
  ],
})
export class LoggerModule {}
'@

  # Patch main.ts to use app.useLogger(app.get(Logger)) and ensure requestId middleware is before logger
  $mainPath = ".\apps\api\src\main.ts"
  if (!(Test-Path $mainPath)) { throw "Não achei apps/api/src/main.ts" }
  Backup-File $mainPath

  $main = Get-Content $mainPath -Raw

  # Ensure imports
  if ($main -notmatch 'from "nestjs-pino"') {
    $main = $main -replace 'import \{ NestFactory \} from "@nestjs/core";',
      "import { NestFactory } from `"@nestjs/core`";`r`nimport { Logger } from `"nestjs-pino`";"
  }

  # Ensure LoggerModule is imported in app.module.ts
  $appModulePath = ".\apps\api\src\app.module.ts"
  if (!(Test-Path $appModulePath)) { throw "Não achei apps/api/src/app.module.ts" }
  Backup-File $appModulePath
  $appModule = Get-Content $appModulePath -Raw

  if ($appModule -notmatch 'LoggerModule') {
    if ($appModule -notmatch 'from "\.\/common\/logger\/logger\.module"') {
      $appModule = $appModule -replace 'import \{ Module \} from "@nestjs/common";',
        'import { Module } from "@nestjs/common";' + "`r`n" + 'import { LoggerModule } from "./common/logger/logger.module";'
    }

    # Add LoggerModule to imports array if exists; if no imports array, create it.
    if ($appModule -match 'imports:\s*\[') {
      $appModule = $appModule -replace 'imports:\s*\[', 'imports: [LoggerModule, '
    } else {
      # If there's no imports property, inject one.
      $appModule = $appModule -replace '\@Module\(\{\s*', '@Module({' + "`r`n  imports: [LoggerModule]," + "`r`n  "
    }
  }

  Write-Utf8NoBom $appModulePath $appModule

  # Ensure requestId middleware is BEFORE any logger usage; then set app logger
  if ($main -notmatch 'app\.useLogger') {
    $main = $main -replace 'const app = await NestFactory\.create\(AppModule\);',
      'const app = await NestFactory.create(AppModule);' + "`r`n" + '  app.useLogger(app.get(Logger));'
  }

  Write-Utf8NoBom $mainPath $main
}

function Add-Web-Loading-Error {
  Write-Host "`n🖥️ Adicionando loading/error boundaries no Next (grupo app)..." -ForegroundColor Cyan

  # Group route layout folder exists
  $groupPath = ".\apps\web\src\app\(app)"
  if (!(Test-Path $groupPath)) { throw "Não achei apps/web/src/app/(app). Confirme sua estrutura." }

  Backup-File "$groupPath\loading.tsx"
  Write-Utf8NoBom "$groupPath\loading.tsx" @'
export default function Loading() {
  return (
    <div className="space-y-4">
      <div className="mag-card p-4">
        <div className="text-sm text-muted-fg">Carregando...</div>
        <div className="mt-2 h-6 w-56 rounded bg-muted animate-pulse" />
        <div className="mt-4 h-4 w-full rounded bg-muted animate-pulse" />
        <div className="mt-2 h-4 w-2/3 rounded bg-muted animate-pulse" />
      </div>
    </div>
  );
}
'@

  Backup-File "$groupPath\error.tsx"
  Write-Utf8NoBom "$groupPath\error.tsx" @'
"use client";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="space-y-4">
      <div className="mag-card p-4">
        <div className="text-sm text-muted-fg">Ocorreu um erro</div>
        <div className="mt-2 text-lg font-semibold">Não foi possível carregar a página.</div>
        <div className="mt-2 text-xs text-muted-fg break-words">{error.message}</div>
        <div className="mt-4 flex gap-2">
          <button className="mag-btn-primary" onClick={() => reset()}>
            Tentar novamente
          </button>
          <a className="mag-btn-ghost" href="/dashboard">
            Voltar ao Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}
'@
}

function Write-Env-Examples {
  Write-Host "`n🔐 Criando .env.example (raiz e apps)..." -ForegroundColor Cyan

  # Root
  if (!(Test-Path ".\.env.example")) {
    Write-Utf8NoBom ".\.env.example" @'
# Root env (documentação)
# Cada app tem o seu .env.local
'@
  }

  # Web
  if (!(Test-Path ".\apps\web\.env.example")) {
    Write-Utf8NoBom ".\apps\web\.env.example" @'
NEXT_PUBLIC_API_URL=http://localhost:3001
'@
  }

  # API
  if (!(Test-Path ".\apps\api\.env.example")) {
    Write-Utf8NoBom ".\apps\api\.env.example" @'
NODE_ENV=development
PORT=3001
'@
  }
}

function Final-Info {
  Write-Host "`n✅ PACOTÃO (GOVERNANÇA + LOGGER) APLICADO!" -ForegroundColor Green
  Write-Host "`nComandos úteis:" -ForegroundColor Yellow
  Write-Host "  pnpm format" -ForegroundColor White
  Write-Host "  pnpm lint" -ForegroundColor White
  Write-Host "  pnpm typecheck" -ForegroundColor White
  Write-Host "  pnpm dev" -ForegroundColor White
  Write-Host "`nHooks ativos:" -ForegroundColor Yellow
  Write-Host "  pre-commit: lint-staged" -ForegroundColor White
  Write-Host "  commit-msg: commitlint (Conventional Commits)" -ForegroundColor White
  Write-Host "`nLogger:" -ForegroundColor Yellow
  Write-Host "  API agora loga com requestId (Pino) automaticamente" -ForegroundColor White
}

# -------- RUN --------
Ensure-RepoRoot
Ensure-Root-PackageScripts
Write-Governance-Files
Install-Governance-Deps
Ensure-Husky
Ensure-App-Scripts-Typecheck
Apply-Api-Pino-Logger
Add-Web-Loading-Error
Write-Env-Examples
Final-Info
