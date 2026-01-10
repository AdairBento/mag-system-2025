import {
  Home,
  Users,
  Car,
  FileText,
  DollarSign,
  MessageCircle,
  AlertCircle,
  Shield,
  Wrench,
  ClipboardCheck,
  BarChart3,
  Settings,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  type: "item";
  name: string;
  href: string;
  icon: LucideIcon;
};

export type NavGroup = {
  type: "group";
  label: string;
};

export const menu: (NavGroup | NavItem)[] = [
  { type: "item", name: "Dashboard", href: "/dashboard", icon: Home },

  { type: "group", label: "Cadastros" },
  { type: "item", name: "Clientes", href: "/clientes", icon: Users },
  { type: "item", name: "Veículos", href: "/veiculos", icon: Car },

  { type: "group", label: "Operação de locação" },
  { type: "item", name: "Locações", href: "/locacoes", icon: FileText },
  { type: "item", name: "Financeiro", href: "/financeiro", icon: DollarSign },
  { type: "item", name: "Comunicação", href: "/comunicacao", icon: MessageCircle },

  { type: "group", label: "Riscos e ocorrências" },
  { type: "item", name: "Multas", href: "/multas", icon: AlertCircle },
  { type: "item", name: "Sinistros", href: "/sinistros", icon: AlertCircle },
  { type: "item", name: "Seguros", href: "/seguros", icon: Shield },

  { type: "group", label: "Suporte e gestão" },
  { type: "item", name: "Manutenção", href: "/manutencao", icon: Wrench },
  { type: "item", name: "Vistorias", href: "/vistorias", icon: ClipboardCheck },
  { type: "item", name: "Relatórios", href: "/relatorios", icon: BarChart3 },
  { type: "item", name: "Configurações", href: "/configuracoes", icon: Settings },
];

export const iconColors: Record<string, string> = {
  "/dashboard": "text-sky-300",
  "/clientes": "text-emerald-300",
  "/veiculos": "text-amber-300",
  "/locacoes": "text-indigo-300",
  "/financeiro": "text-rose-300",
  "/comunicacao": "text-cyan-300",
  "/multas": "text-orange-300",
  "/sinistros": "text-red-300",
  "/seguros": "text-teal-300",
  "/manutencao": "text-yellow-300",
  "/vistorias": "text-blue-300",
  "/relatorios": "text-purple-300",
  "/configuracoes": "text-slate-300",
};
