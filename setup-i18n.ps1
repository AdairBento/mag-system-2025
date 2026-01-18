# ============================================================
# MAG LOCAÇÃO SYSTEM - SETUP AUTOMÁTICO I18N
# ============================================================
# Script: setup-i18n.ps1
# Descrição: Configura sistema de tradução PT-BR automaticamente
# Autor: MAG System
# Data: 2026-01-18
# ============================================================

$ErrorActionPreference = "Stop"

# Cores para output
function Write-Success { Write-Host $args -ForegroundColor Green }
function Write-Info { Write-Host $args -ForegroundColor Cyan }
function Write-Warning { Write-Host $args -ForegroundColor Yellow }
function Write-Error { Write-Host $args -ForegroundColor Red }

# ============================================================
# CONFIGURAÇÕES
# ============================================================

$PROJECT_ROOT = "C:\Users\adair\PycharmProject\MAG-system-webapp"
$FRONTEND_PATH = Join-Path $PROJECT_ROOT "apps\web"
$SRC_PATH = Join-Path $FRONTEND_PATH "src"

# Diretórios
$I18N_DIR = Join-Path $SRC_PATH "i18n"
$LOCALES_DIR = Join-Path $I18N_DIR "locales"
$HOOKS_DIR = Join-Path $SRC_PATH "hooks"
$COMPONENTS_DIR = Join-Path $SRC_PATH "components"
$FORMS_DIR = Join-Path $COMPONENTS_DIR "forms"
$TABLES_DIR = Join-Path $COMPONENTS_DIR "tables"

Write-Info "======================================================"
Write-Info "  🚀 MAG LOCAÇÃO - SETUP AUTOMÁTICO I18N"
Write-Info "======================================================"
Write-Info ""

# ============================================================
# PASSO 1: Verificar estrutura do projeto
# ============================================================

Write-Info "📁 PASSO 1: Verificando estrutura do projeto..."

if (-not (Test-Path $PROJECT_ROOT)) {
    Write-Error "❌ Erro: Diretório raiz não encontrado: $PROJECT_ROOT"
    exit 1
}

if (-not (Test-Path $FRONTEND_PATH)) {
    Write-Error "❌ Erro: Frontend não encontrado: $FRONTEND_PATH"
    exit 1
}

if (-not (Test-Path $SRC_PATH)) {
    Write-Error "❌ Erro: Diretório src não encontrado: $SRC_PATH"
    exit 1
}

Write-Success "✅ Estrutura do projeto OK"
Write-Info ""

# ============================================================
# PASSO 2: Criar estrutura de diretórios
# ============================================================

Write-Info "📁 PASSO 2: Criando estrutura de diretórios..."

$directories = @(
    $I18N_DIR,
    $LOCALES_DIR,
    $HOOKS_DIR,
    $FORMS_DIR,
    $TABLES_DIR
)

foreach ($dir in $directories) {
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
        Write-Success "   ✅ Criado: $dir"
    } else {
        Write-Warning "   ⚠️  Já existe: $dir"
    }
}

Write-Info ""

# ============================================================
# PASSO 3: Criar arquivo de tradução PT-BR
# ============================================================

Write-Info "📝 PASSO 3: Criando arquivo de tradução PT-BR..."

$ptBR_JSON = @'
{
  "common": {
    "save": "Salvar",
    "cancel": "Cancelar",
    "edit": "Editar",
    "delete": "Excluir",
    "create": "Criar",
    "update": "Atualizar",
    "search": "Buscar",
    "filter": "Filtrar",
    "clear": "Limpar",
    "back": "Voltar",
    "next": "Próximo",
    "previous": "Anterior",
    "loading": "Carregando...",
    "noData": "Nenhum registro encontrado",
    "actions": "Ações",
    "status": "Status",
    "active": "Ativo",
    "inactive": "Inativo",
    "yes": "Sim",
    "no": "Não",
    "confirm": "Confirmar",
    "close": "Fechar"
  },
  "validation": {
    "required": "Campo obrigatório",
    "invalidEmail": "E-mail inválido",
    "invalidCPF": "CPF inválido",
    "invalidCNPJ": "CNPJ inválido",
    "invalidPhone": "Telefone inválido",
    "invalidPlate": "Placa inválida",
    "minLength": "Mínimo de {{min}} caracteres",
    "maxLength": "Máximo de {{max}} caracteres",
    "minValue": "Valor mínimo: {{min}}",
    "maxValue": "Valor máximo: {{max}}",
    "invalidDate": "Data inválida",
    "futureDateRequired": "Data deve ser futura",
    "pastDateRequired": "Data deve ser passada"
  },
  "messages": {
    "success": {
      "created": "Registro criado com sucesso!",
      "updated": "Registro atualizado com sucesso!",
      "deleted": "Registro excluído com sucesso!",
      "saved": "Salvo com sucesso!"
    },
    "error": {
      "generic": "Ocorreu um erro. Tente novamente.",
      "notFound": "Registro não encontrado",
      "duplicated": "Registro duplicado",
      "invalidData": "Dados inválidos",
      "networkError": "Erro de conexão"
    },
    "confirm": {
      "delete": "Tem certeza que deseja excluir este registro?",
      "cancel": "Tem certeza que deseja cancelar?",
      "discard": "Descartar alterações?"
    }
  },
  "clients": {
    "title": "Clientes",
    "singular": "Cliente",
    "list": "Lista de Clientes",
    "create": "Novo Cliente",
    "edit": "Editar Cliente",
    "details": "Detalhes do Cliente",
    "delete": "Excluir Cliente",
    "fields": {
      "type": "Tipo",
      "status": "Status",
      "name": "Nome",
      "cpf": "CPF",
      "rg": "RG",
      "birthDate": "Data de Nascimento",
      "companyName": "Razão Social",
      "cnpj": "CNPJ",
      "tradeName": "Nome Fantasia",
      "stateRegistration": "Inscrição Estadual",
      "cellphone": "Celular",
      "telephone": "Telefone",
      "email": "E-mail",
      "zipCode": "CEP",
      "street": "Logradouro",
      "number": "Número",
      "complement": "Complemento",
      "neighborhood": "Bairro",
      "city": "Cidade",
      "state": "Estado",
      "licenseNumber": "Número da CNH",
      "licenseCategory": "Categoria da CNH",
      "licenseExpiry": "Validade da CNH",
      "notes": "Observações"
    },
    "types": {
      "PF": "Pessoa Física",
      "PJ": "Pessoa Jurídica"
    },
    "status": {
      "ATIVO": "Ativo",
      "INATIVO": "Inativo",
      "BLOQUEADO": "Bloqueado"
    },
    "placeholders": {
      "name": "Digite o nome completo",
      "cpf": "000.000.000-00",
      "cnpj": "00.000.000/0000-00",
      "email": "exemplo@email.com",
      "cellphone": "(00) 00000-0000",
      "zipCode": "00000-000",
      "street": "Nome da rua",
      "number": "Nº",
      "neighborhood": "Nome do bairro",
      "city": "Nome da cidade",
      "notes": "Informações adicionais..."
    }
  },
  "vehicles": {
    "title": "Veículos",
    "singular": "Veículo",
    "list": "Lista de Veículos",
    "create": "Novo Veículo",
    "edit": "Editar Veículo",
    "details": "Detalhes do Veículo",
    "delete": "Excluir Veículo",
    "fields": {
      "plate": "Placa",
      "brand": "Marca",
      "model": "Modelo",
      "year": "Ano",
      "modelYear": "Ano Modelo",
      "color": "Cor",
      "mileage": "Quilometragem",
      "renavam": "RENAVAM",
      "chassi": "Chassi",
      "status": "Status",
      "category": "Categoria",
      "fuelType": "Tipo de Combustível",
      "dailyRate": "Diária",
      "weeklyRate": "Semanal",
      "monthlyRate": "Mensal",
      "ipvaAmount": "Valor IPVA",
      "ipvaExpiry": "Vencimento IPVA",
      "insuranceAmount": "Valor Seguro",
      "insuranceExpiry": "Vencimento Seguro",
      "notes": "Observações"
    },
    "status": {
      "DISPONIVEL": "Disponível",
      "LOCADO": "Locado",
      "MANUTENCAO": "Manutenção",
      "INATIVO": "Inativo"
    },
    "categories": {
      "SUV": "SUV",
      "SEDAN": "Sedan",
      "HATCH": "Hatchback",
      "PICKUP": "Pickup",
      "VAN": "Van"
    },
    "fuelTypes": {
      "GASOLINE": "Gasolina",
      "ETHANOL": "Etanol",
      "FLEX": "Flex",
      "DIESEL": "Diesel",
      "ELECTRIC": "Elétrico",
      "HYBRID": "Híbrido"
    },
    "placeholders": {
      "plate": "ABC-1D23",
      "brand": "Ex: Toyota, Honda, Fiat",
      "model": "Ex: Corolla, Civic, Uno",
      "year": "2023",
      "mileage": "0 km",
      "renavam": "00000000000",
      "chassi": "9BWZZZ377VT004251",
      "dailyRate": "R$ 0,00",
      "notes": "Informações adicionais sobre o veículo..."
    }
  },
  "drivers": {
    "title": "Motoristas",
    "singular": "Motorista",
    "list": "Lista de Motoristas",
    "create": "Novo Motorista",
    "edit": "Editar Motorista",
    "details": "Detalhes do Motorista",
    "delete": "Excluir Motorista",
    "fields": {
      "name": "Nome",
      "cpf": "CPF",
      "email": "E-mail",
      "phone": "Telefone",
      "cellphone": "Celular",
      "licenseNumber": "Número da CNH",
      "licenseCategory": "Categoria da CNH",
      "licenseExpiry": "Validade da CNH",
      "status": "Status",
      "clientId": "Cliente Vinculado",
      "clientName": "Nome do Cliente"
    },
    "status": {
      "ATIVO": "Ativo",
      "INATIVO": "Inativo"
    },
    "licenseCategories": {
      "A": "A - Motocicletas",
      "B": "B - Automóveis",
      "C": "C - Caminhões pequenos",
      "D": "D - Ônibus",
      "E": "E - Caminhões articulados",
      "AB": "AB - Motos e carros",
      "AC": "AC - Motos e caminhões",
      "AD": "AD - Motos e ônibus",
      "AE": "AE - Motos e articulados"
    },
    "placeholders": {
      "name": "Digite o nome completo",
      "cpf": "000.000.000-00",
      "email": "exemplo@email.com",
      "cellphone": "(00) 00000-0000",
      "licenseNumber": "00000000000",
      "licenseExpiry": "dd/mm/aaaa"
    }
  },
  "navigation": {
    "home": "Início",
    "clients": "Clientes",
    "drivers": "Motoristas",
    "vehicles": "Veículos",
    "rentals": "Locações",
    "maintenance": "Manutenção",
    "reports": "Relatórios",
    "settings": "Configurações",
    "logout": "Sair"
  }
}
'@

$ptBR_Path = Join-Path $LOCALES_DIR "pt-BR.json"
Set-Content -Path $ptBR_Path -Value $ptBR_JSON -Encoding UTF8
Write-Success "✅ Criado: pt-BR.json"
Write-Info ""

# ============================================================
# PASSO 4: Criar arquivo de configuração
# ============================================================

Write-Info "⚙️  PASSO 4: Criando arquivo de configuração..."

$config_TS = @'
import ptBR from './locales/pt-BR.json';

export const defaultLocale = 'pt-BR';
export const locales = ['pt-BR'] as const;

export type Locale = typeof locales[number];

export const translations = {
  'pt-BR': ptBR,
};

export function getTranslation(locale: Locale = defaultLocale) {
  return translations[locale];
}
'@

$config_Path = Join-Path $I18N_DIR "config.ts"
Set-Content -Path $config_Path -Value $config_TS -Encoding UTF8
Write-Success "✅ Criado: config.ts"
Write-Info ""

# ============================================================
# PASSO 5: Criar hook useTranslation
# ============================================================

Write-Info "🎣 PASSO 5: Criando hook useTranslation..."

$useTranslation_TS = @'
import { useCallback } from 'react';
import { getTranslation } from '@/i18n/config';

type TranslationKey = string;

interface TranslationParams {
  [key: string]: string | number;
}

export function useTranslation() {
  const t = useCallback((key: TranslationKey, params?: TranslationParams): string => {
    const translations = getTranslation();

    // Navega pelo objeto usando a chave (ex: "clients.fields.name")
    const keys = key.split('.');
    let value: any = translations;

    for (const k of keys) {
      value = value?.[k];
      if (value === undefined) {
        console.warn('Translation key not found: ' + key);
        return key;
      }
    }

    // Substitui parâmetros (ex: "{{min}}" por valor real)
    if (params && typeof value === 'string') {
      return value.replace(/\{\{(\w+)\}\}/g, (_, param) => {
        return params[param]?.toString() || '';
      });
    }

    return value;
  }, []);

  return { t };
}
'@

$useTranslation_Path = Join-Path $HOOKS_DIR "useTranslation.ts"
Set-Content -Path $useTranslation_Path -Value $useTranslation_TS -Encoding UTF8
Write-Success "✅ Criado: useTranslation.ts"
Write-Info ""

# ============================================================
# PASSO 6: Criar exemplo de componente
# ============================================================

Write-Info "📦 PASSO 6: Criando exemplo de componente (ClientForm)..."

$clientForm_TSX = @'
'use client';

import { useTranslation } from '@/hooks/useTranslation';

export function ClientFormExample() {
  const { t } = useTranslation();

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">
        {t('clients.create')}
      </h2>

      <form className="space-y-4">
        {/* Campo Nome */}
        <div>
          <label className="block text-sm font-medium mb-1">
            {t('clients.fields.name')} *
          </label>
          <input
            type="text"
            placeholder={t('clients.placeholders.name')}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        {/* Campo CPF */}
        <div>
          <label className="block text-sm font-medium mb-1">
            {t('clients.fields.cpf')} *
          </label>
          <input
            type="text"
            placeholder={t('clients.placeholders.cpf')}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        {/* Campo Email */}
        <div>
          <label className="block text-sm font-medium mb-1">
            {t('clients.fields.email')}
          </label>
          <input
            type="email"
            placeholder={t('clients.placeholders.email')}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        {/* Botões */}
        <div className="flex gap-2">
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            {t('common.save')}
          </button>
          <button
            type="button"
            className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
          >
            {t('common.cancel')}
          </button>
        </div>
      </form>
    </div>
  );
}
'@

$clientForm_Path = Join-Path $FORMS_DIR "ClientFormExample.tsx"
Set-Content -Path $clientForm_Path -Value $clientForm_TSX -Encoding UTF8
Write-Success "✅ Criado: ClientFormExample.tsx"
Write-Info ""

# ============================================================
# RESUMO FINAL
# ============================================================

Write-Info "======================================================"
Write-Success "  ✅ SETUP CONCLUÍDO COM SUCESSO!"
Write-Info "======================================================"
Write-Info ""

Write-Info "📁 Arquivos criados:"
Write-Success "   ✅ $ptBR_Path"
Write-Success "   ✅ $config_Path"
Write-Success "   ✅ $useTranslation_Path"
Write-Success "   ✅ $clientForm_Path"
Write-Info ""

Write-Info "🎯 Próximos passos:"
Write-Info "   1. Verifique os arquivos criados"
Write-Info "   2. Importe o hook useTranslation nos seus componentes"
Write-Info "   3. Use: const { t } = useTranslation()"
Write-Info "   4. Acesse traduções: t('clients.fields.name')"
Write-Info ""

Write-Info "📚 Exemplo de uso:"
Write-Info '   const { t } = useTranslation();'
Write-Info '   <label>{t("clients.fields.name")}</label>'
Write-Info ""

Write-Info "🚀 Sistema de tradução configurado e pronto!"
Write-Info "======================================================"
