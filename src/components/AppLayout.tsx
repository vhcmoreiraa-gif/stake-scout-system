import { ReactNode } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  TrendingUp, Bell, Settings, LogOut, RefreshCw, Radar, Repeat,
  Calculator, ListChecks, BarChart3, Wallet, Cog, ShieldAlert
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const tabs = [
  { to: "/", label: "Dashboard", icon: TrendingUp, end: true },
  { to: "/scanner", label: "Scanner", icon: Radar },
  { to: "/freebet", label: "Converter Freebet", icon: Repeat },
  { to: "/calculadora", label: "Calculadora", icon: Calculator },
  { to: "/apostas", label: "Minhas Apostas", icon: ListChecks },
  { to: "/estatisticas", label: "Estatísticas", icon: BarChart3 },
  { to: "/bankroll", label: "Bankroll", icon: Wallet },
  { to: "/jogo-responsavel", label: "Jogo Responsável", icon: ShieldAlert },
  { to: "/configuracoes", label: "Configurações", icon: Cog },
];

export default function AppLayout({ children }: { children: ReactNode }) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const initial = (user?.user_metadata?.display_name || user?.email || "U")[0].toUpperCase();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-background/70 border-b border-border">
        <div className="max-w-[1400px] mx-auto px-4 lg:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center glow-primary">
              <TrendingUp className="w-5 h-5 text-primary-foreground" />
            </div>
            <div className="hidden sm:block">
              <div className="font-bold leading-tight">BetControl <span className="text-gradient">Pro</span></div>
              <div className="text-[10px] text-muted-foreground leading-tight">Gestão Inteligente de Apostas</div>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-2 text-xs text-muted-foreground">
            <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span>Última atualização: agora</span>
            <Button size="sm" variant="ghost" className="h-7 ml-2 gap-1">
              <RefreshCw className="w-3 h-3" /> Atualizar
            </Button>
          </div>

          <div className="flex items-center gap-1">
            <Button size="icon" variant="ghost" className="rounded-full"><Bell className="w-4 h-4" /></Button>
            <Button size="icon" variant="ghost" className="rounded-full" onClick={() => navigate("/configuracoes")}>
              <Settings className="w-4 h-4" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="ml-1 w-9 h-9 rounded-full gradient-primary text-primary-foreground font-semibold flex items-center justify-center hover:opacity-90 transition">
                  {initial}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="text-sm font-medium">{user?.user_metadata?.display_name || "Usuário"}</div>
                  <div className="text-xs text-muted-foreground truncate">{user?.email}</div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/configuracoes")}>
                  <Cog className="w-4 h-4 mr-2" /> Configurações
                </DropdownMenuItem>
                <DropdownMenuItem onClick={async () => { await signOut(); navigate("/auth"); }}>
                  <LogOut className="w-4 h-4 mr-2" /> Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <nav className="border-t border-border/50 bg-background/40">
          <div className="max-w-[1400px] mx-auto px-2 lg:px-4 flex gap-1 overflow-x-auto scrollbar-none">
            {tabs.map((t) => (
              <NavLink
                key={t.to}
                to={t.to}
                end={t.end}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-2 px-3 py-2.5 text-xs font-medium whitespace-nowrap border-b-2 transition-colors",
                    isActive
                      ? "border-primary text-foreground"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  )
                }
              >
                <t.icon className="w-3.5 h-3.5" />
                {t.label}
              </NavLink>
            ))}
          </div>
        </nav>
      </header>

      <main className="flex-1 max-w-[1400px] w-full mx-auto px-4 lg:px-6 py-6 animate-fade-in">
        {children}
      </main>

      <footer className="border-t border-border/50 py-4 text-center text-[11px] text-muted-foreground">
        BetControl Pro · Apenas controle financeiro e organização pessoal · Aposte com responsabilidade
      </footer>
    </div>
  );
}
