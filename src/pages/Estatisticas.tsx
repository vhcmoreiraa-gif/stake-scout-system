import { useMemo } from "react";
import { useBets } from "@/hooks/useBets";
import { StatCard } from "@/components/StatCard";
import { Card } from "@/components/ui/card";
import { formatCurrency, formatPercent } from "@/lib/bets";
import { Trophy, TrendingDown, TrendingUp, Target, Zap, Award, Activity, BarChart2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

const COLORS = ["hsl(var(--primary))", "hsl(var(--accent))", "hsl(var(--success))", "hsl(var(--warning))", "hsl(var(--destructive))", "hsl(217 91% 50%)"];

export default function Estatisticas() {
  const { data: bets = [] } = useBets();

  const s = useMemo(() => {
    const settled = bets.filter((b) => b.result !== "pendente" && b.result !== "cancelado");
    const wins = settled.filter((b) => b.result === "green" || b.result === "duplo_green" || b.result === "meio_green");
    const duplos = settled.filter((b) => b.result === "duplo_green");
    const meios = settled.filter((b) => b.result === "meio_green");
    const losses = settled.filter((b) => b.result === "red");
    const totalStake = settled.reduce((s, b) => s + Number(b.stake), 0);
    const profit = settled.reduce((s, b) => s + Number(b.profit), 0);
    const roi = totalStake > 0 ? (profit / totalStake) * 100 : 0;
    const profits = settled.map((b) => Number(b.profit));
    const maxGain = profits.length ? Math.max(...profits) : 0;
    const maxLoss = profits.length ? Math.min(...profits) : 0;

    // streaks
    let curW = 0, curL = 0, maxW = 0, maxL = 0;
    settled.slice().reverse().forEach((b) => {
      if (b.result === "red") { curL++; curW = 0; maxL = Math.max(maxL, curL); }
      else { curW++; curL = 0; maxW = Math.max(maxW, curW); }
    });

    const byMonth: Record<string, number> = {};
    settled.forEach((b) => { const m = b.bet_date.slice(0, 7); byMonth[m] = (byMonth[m] ?? 0) + Number(b.profit); });
    const monthData = Object.entries(byMonth).sort().map(([m, v]) => ({ month: m, lucro: Number(v.toFixed(2)) }));

    const byCat: Record<string, number> = {};
    settled.forEach((b) => { byCat[b.category] = (byCat[b.category] ?? 0) + Number(b.profit); });
    const catData = Object.entries(byCat).map(([name, value]) => ({ name, value: Number(value.toFixed(2)) }));

    const byBook: Record<string, number> = {};
    settled.forEach((b) => { byBook[b.bookmaker] = (byBook[b.bookmaker] ?? 0) + Number(b.profit); });
    const bookData = Object.entries(byBook).map(([name, value]) => ({ name, lucro: Number(value.toFixed(2)) }));

    return {
      searches: bets.length, opportunities: settled.length, totalStake, roi,
      wins: wins.length, duplos: duplos.length, meios: meios.length, losses: losses.length,
      maxGain, maxLoss, maxW, maxL, monthData, catData, bookData,
    };
  }, [bets]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Estatísticas</h1>
        <p className="text-sm text-muted-foreground">Performance detalhada das suas entradas</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard label="Buscas" value={s.searches} icon={Activity} variant="primary" />
        <StatCard label="Oportunidades" value={s.opportunities} icon={Zap} variant="accent" />
        <StatCard label="Investimento" value={formatCurrency(s.totalStake)} icon={Target} />
        <StatCard label="ROI" value={formatPercent(s.roi)} icon={BarChart2} variant={s.roi >= 0 ? "success" : "danger"} />
        <StatCard label="Vitórias" value={s.wins} icon={Trophy} variant="success" />
        <StatCard label="Perdas" value={s.losses} icon={TrendingDown} variant="danger" />
        <StatCard label="Duplo Green" value={s.duplos} variant="success" />
        <StatCard label="Meio Green" value={s.meios} variant="warning" />
        <StatCard label="Maior ganho" value={formatCurrency(s.maxGain)} icon={TrendingUp} variant="success" />
        <StatCard label="Maior perda" value={formatCurrency(s.maxLoss)} icon={TrendingDown} variant="danger" />
        <StatCard label="Seq. vitórias" value={s.maxW} icon={Award} variant="success" />
        <StatCard label="Seq. perdas" value={s.maxL} icon={TrendingDown} variant="danger" />
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card className="card-elevated p-5 rounded-xl">
          <h3 className="font-semibold mb-4">Lucro/Prejuízo por mês</h3>
          <div className="h-64">
            {s.monthData.length === 0 ? <Empty /> : (
              <ResponsiveContainer><BarChart data={s.monthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                <Bar dataKey="lucro" fill="hsl(var(--primary))" radius={[6,6,0,0]} />
              </BarChart></ResponsiveContainer>
            )}
          </div>
        </Card>

        <Card className="card-elevated p-5 rounded-xl">
          <h3 className="font-semibold mb-4">Resultado por categoria</h3>
          <div className="h-64">
            {s.catData.length === 0 ? <Empty /> : (
              <ResponsiveContainer><PieChart>
                <Pie data={s.catData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                  {s.catData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                <Legend />
              </PieChart></ResponsiveContainer>
            )}
          </div>
        </Card>

        <Card className="card-elevated p-5 rounded-xl lg:col-span-2">
          <h3 className="font-semibold mb-4">Resultado por casa de aposta</h3>
          <div className="h-64">
            {s.bookData.length === 0 ? <Empty /> : (
              <ResponsiveContainer><BarChart data={s.bookData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <YAxis type="category" dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} width={100} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                <Bar dataKey="lucro" fill="hsl(var(--accent))" radius={[0,6,6,0]} />
              </BarChart></ResponsiveContainer>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

function Empty() {
  return <div className="h-full flex items-center justify-center text-sm text-muted-foreground">Sem dados ainda</div>;
}
