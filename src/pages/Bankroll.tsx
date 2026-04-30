import { useEffect, useMemo, useState } from "react";
import { useBets, useBankroll } from "@/hooks/useBets";
import { useAuth } from "@/contexts/AuthContext";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { StatCard } from "@/components/StatCard";
import { formatCurrency, formatPercent } from "@/lib/bets";
import { Wallet, Target, TrendingUp, AlertTriangle, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

export default function Bankroll() {
  const { user } = useAuth();
  const { data: bets = [] } = useBets();
  const { data: settings } = useBankroll();
  const qc = useQueryClient();

  const [form, setForm] = useState({
    initial_balance: 1000, goal: 0, daily_limit: 0, weekly_limit: 0, monthly_limit: 0, stop_loss: 0,
  });

  useEffect(() => {
    if (settings) setForm({
      initial_balance: Number(settings.initial_balance), goal: Number(settings.goal),
      daily_limit: Number(settings.daily_limit), weekly_limit: Number(settings.weekly_limit),
      monthly_limit: Number(settings.monthly_limit), stop_loss: Number(settings.stop_loss),
    });
  }, [settings]);

  const stats = useMemo(() => {
    const settled = bets.filter((b) => b.result !== "pendente" && b.result !== "cancelado");
    const profit = settled.reduce((s, b) => s + Number(b.profit), 0);
    const totalStake = bets.reduce((s, b) => s + Number(b.stake), 0);
    const totalSettledStake = settled.reduce((s, b) => s + Number(b.stake), 0);
    const roi = totalSettledStake > 0 ? (profit / totalSettledStake) * 100 : 0;

    const today = new Date().toISOString().slice(0, 10);
    const todayLoss = -settled.filter((b) => b.bet_date === today && Number(b.profit) < 0).reduce((s, b) => s + Number(b.profit), 0);

    const w = new Date(); w.setDate(w.getDate() - 7);
    const wkLoss = -settled.filter((b) => b.bet_date >= w.toISOString().slice(0,10) && Number(b.profit) < 0).reduce((s,b)=>s+Number(b.profit),0);
    const m = new Date(); m.setDate(m.getDate() - 30);
    const moLoss = -settled.filter((b) => b.bet_date >= m.toISOString().slice(0,10) && Number(b.profit) < 0).reduce((s,b)=>s+Number(b.profit),0);

    return { profit, totalStake, roi, current: form.initial_balance + profit, todayLoss, wkLoss, moLoss };
  }, [bets, form.initial_balance]);

  const save = async () => {
    if (!user) return;
    const { error } = await supabase.from("bankroll_settings").upsert({ user_id: user.id, ...form });
    if (error) return toast.error(error.message);
    toast.success("Configurações salvas");
    qc.invalidateQueries({ queryKey: ["bankroll"] });
  };

  const goalPct = form.goal > 0 ? Math.min(100, (stats.profit / form.goal) * 100) : 0;

  const Alert = ({ used, limit, label }: { used: number; limit: number; label: string }) => {
    if (limit <= 0) return null;
    const pct = Math.min(100, (used / limit) * 100);
    const danger = pct >= 100;
    const warn = pct >= 75 && pct < 100;
    return (
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">{label}</span>
          <span className={danger ? "text-destructive font-semibold" : warn ? "text-warning" : "text-muted-foreground"}>
            {formatCurrency(used)} / {formatCurrency(limit)}
          </span>
        </div>
        <Progress value={pct} className={danger ? "[&>div]:bg-destructive" : warn ? "[&>div]:bg-warning" : "[&>div]:bg-primary"} />
        {danger && <p className="text-xs text-destructive flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Limite ultrapassado!</p>}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Gestão de Bankroll</h1>
        <p className="text-sm text-muted-foreground">Mantenha disciplina financeira com limites e metas</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <StatCard label="Saldo inicial" value={formatCurrency(form.initial_balance)} icon={Wallet} variant="primary" />
        <StatCard label="Saldo atual" value={formatCurrency(stats.current)} icon={ShieldCheck} variant={stats.current >= form.initial_balance ? "success" : "danger"} />
        <StatCard label="Total investido" value={formatCurrency(stats.totalStake)} />
        <StatCard label="Lucro líquido" value={formatCurrency(stats.profit)} icon={TrendingUp} variant={stats.profit >= 0 ? "success" : "danger"} />
        <StatCard label="ROI" value={formatPercent(stats.roi)} icon={Target} variant={stats.roi >= 0 ? "success" : "danger"} />
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card className="card-elevated p-5 rounded-xl space-y-4">
          <h3 className="font-semibold">Configurar banca</h3>
          <div className="grid grid-cols-2 gap-3">
            <NumField label="Saldo inicial" value={form.initial_balance} onChange={(v) => setForm({ ...form, initial_balance: v })} />
            <NumField label="Meta de ganho" value={form.goal} onChange={(v) => setForm({ ...form, goal: v })} />
            <NumField label="Limite diário (perda)" value={form.daily_limit} onChange={(v) => setForm({ ...form, daily_limit: v })} />
            <NumField label="Limite semanal" value={form.weekly_limit} onChange={(v) => setForm({ ...form, weekly_limit: v })} />
            <NumField label="Limite mensal" value={form.monthly_limit} onChange={(v) => setForm({ ...form, monthly_limit: v })} />
            <NumField label="Stop loss total" value={form.stop_loss} onChange={(v) => setForm({ ...form, stop_loss: v })} />
          </div>
          <Button onClick={save} className="gradient-primary border-0 w-full">Salvar configurações</Button>
        </Card>

        <Card className="card-elevated p-5 rounded-xl space-y-5">
          <h3 className="font-semibold">Acompanhamento</h3>
          {form.goal > 0 && (
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Meta de ganho</span>
                <span className="text-success">{formatCurrency(stats.profit)} / {formatCurrency(form.goal)}</span>
              </div>
              <Progress value={goalPct} className="[&>div]:bg-success" />
            </div>
          )}
          <Alert used={stats.todayLoss} limit={form.daily_limit} label="Perda hoje" />
          <Alert used={stats.wkLoss} limit={form.weekly_limit} label="Perda 7 dias" />
          <Alert used={stats.moLoss} limit={form.monthly_limit} label="Perda 30 dias" />
          {form.stop_loss > 0 && stats.profit <= -form.stop_loss && (
            <div className="p-3 rounded-lg bg-destructive/15 border border-destructive/40 text-sm text-destructive flex gap-2">
              <AlertTriangle className="w-4 h-4 mt-0.5" /> Stop loss atingido. Considere uma pausa.
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

function NumField({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      <Input type="number" step="0.01" value={value} onChange={(e) => onChange(Number(e.target.value))} />
    </div>
  );
}
