import { useMemo } from "react";
import { useBets, useBankroll } from "@/hooks/useBets";
import { StatCard } from "@/components/StatCard";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatPercent, RESULT_LABELS } from "@/lib/bets";
import { TrendingUp, TrendingDown, DollarSign, Target, Calendar, Trophy, Activity, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";

export default function Dashboard() {
  const { data: bets = [], isLoading } = useBets();
  const { data: bankroll } = useBankroll();

  const stats = useMemo(() => {
    const settled = bets.filter((b) => b.result !== "pendente" && b.result !== "cancelado");
    const totalStake = bets.reduce((s, b) => s + Number(b.stake), 0);
    const totalReturn = bets.reduce((s, b) => s + Number(b.received), 0);
    const profit = settled.reduce((s, b) => s + Number(b.profit), 0);
    const totalSettledStake = settled.reduce((s, b) => s + Number(b.stake), 0);
    const roi = totalSettledStake > 0 ? (profit / totalSettledStake) * 100 : 0;
    const upcoming = bets.find((b) => b.result === "pendente");

    // Evolution chart
    const sorted = [...bets].sort((a, b) => a.bet_date.localeCompare(b.bet_date));
    let cum = bankroll?.initial_balance ?? 0;
    const evolution = sorted.map((b) => {
      cum += Number(b.profit);
      return { date: b.bet_date.slice(5), saldo: Number(cum.toFixed(2)) };
    });

    return { count: bets.length, totalStake, totalReturn, profit, roi, upcoming, evolution };
  }, [bets, bankroll]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Visão geral</h1>
          <p className="text-sm text-muted-foreground">Acompanhe sua performance e gestão financeira</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1.5"><Sparkles className="w-3 h-3 text-accent" />{stats.count} entradas registradas</Badge>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard label="Apostas" value={stats.count} icon={Activity} variant="primary" />
        <StatCard label="Investimento" value={formatCurrency(stats.totalStake)} icon={DollarSign} variant="default" />
        <StatCard label="Retorno" value={formatCurrency(stats.totalReturn)} icon={Trophy} variant="accent" />
        <StatCard
          label="Lucro / Prejuízo"
          value={formatCurrency(stats.profit)}
          icon={stats.profit >= 0 ? TrendingUp : TrendingDown}
          variant={stats.profit >= 0 ? "success" : "danger"}
        />
        <StatCard label="ROI" value={formatPercent(stats.roi)} icon={Target} variant={stats.roi >= 0 ? "success" : "danger"} />
        <StatCard
          label="Próximo evento"
          value={stats.upcoming?.event ?? "—"}
          hint={stats.upcoming ? `${stats.upcoming.bet_date} · ${stats.upcoming.bookmaker}` : "Sem pendentes"}
          icon={Calendar}
          variant="warning"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="card-elevated p-5 rounded-xl lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold">Evolução do saldo</h3>
              <p className="text-xs text-muted-foreground">Baseado no saldo inicial e lucro acumulado</p>
            </div>
          </div>
          <div className="h-64">
            {stats.evolution.length === 0 ? (
              <EmptyChart />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.evolution}>
                  <defs>
                    <linearGradient id="colSaldo" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.5} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                  <Area type="monotone" dataKey="saldo" stroke="hsl(var(--primary))" fill="url(#colSaldo)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        <Card className="card-elevated p-5 rounded-xl">
          <h3 className="font-semibold mb-4">Últimas entradas</h3>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {isLoading && <p className="text-xs text-muted-foreground">Carregando...</p>}
            {!isLoading && bets.length === 0 && (
              <div className="text-center py-6">
                <p className="text-sm text-muted-foreground mb-3">Nenhuma aposta registrada ainda.</p>
                <Link to="/apostas"><Button size="sm" className="gradient-primary border-0">Adicionar primeira aposta</Button></Link>
              </div>
            )}
            {bets.slice(0, 6).map((b) => (
              <div key={b.id} className="flex items-center justify-between gap-2 p-2 rounded-lg hover:bg-secondary/40">
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{b.event}</p>
                  <p className="text-xs text-muted-foreground truncate">{b.bookmaker} · {b.category}</p>
                </div>
                <Badge
                  className={
                    b.result === "green" || b.result === "duplo_green" ? "bg-success/20 text-success border-success/30" :
                    b.result === "red" ? "bg-destructive/20 text-destructive border-destructive/30" :
                    b.result === "pendente" ? "bg-warning/20 text-warning border-warning/30" :
                    "bg-secondary"
                  }
                  variant="outline"
                >
                  {RESULT_LABELS[b.result]}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function EmptyChart() {
  return (
    <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
      Registre apostas para visualizar a evolução
    </div>
  );
}
