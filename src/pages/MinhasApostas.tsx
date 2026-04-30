import { useMemo, useState } from "react";
import { useBets } from "@/hooks/useBets";
import { useAuth } from "@/contexts/AuthContext";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ALL_CATEGORIES, Bet, BetResult, BetType, RESULT_LABELS, calcProfit, formatCurrency } from "@/lib/bets";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Pencil, Download, Search } from "lucide-react";
import { toast } from "sonner";

type FormState = Omit<Bet, "id" | "user_id" | "created_at" | "updated_at" | "profit">;

const empty: FormState = {
  bet_date: new Date().toISOString().slice(0, 10),
  bookmaker: "",
  bet_type: "esporte",
  category: "Futebol",
  event: "",
  odd: 1.5,
  stake: 0,
  expected_return: 0,
  result: "pendente",
  received: 0,
  notes: "",
};

export default function MinhasApostas() {
  const { user } = useAuth();
  const { data: bets = [] } = useBets();
  const qc = useQueryClient();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(empty);
  const [filters, setFilters] = useState({ q: "", bookmaker: "all", type: "all", category: "all", result: "all" });

  const filtered = useMemo(() => {
    return bets.filter((b) => {
      if (filters.q && !b.event.toLowerCase().includes(filters.q.toLowerCase())) return false;
      if (filters.bookmaker !== "all" && b.bookmaker !== filters.bookmaker) return false;
      if (filters.type !== "all" && b.bet_type !== filters.type) return false;
      if (filters.category !== "all" && b.category !== filters.category) return false;
      if (filters.result !== "all" && b.result !== filters.result) return false;
      return true;
    });
  }, [bets, filters]);

  const bookmakers = Array.from(new Set(bets.map((b) => b.bookmaker))).filter(Boolean);

  const openNew = () => { setForm(empty); setEditing(null); setOpen(true); };
  const openEdit = (b: Bet) => {
    setForm({
      bet_date: b.bet_date, bookmaker: b.bookmaker, bet_type: b.bet_type, category: b.category,
      event: b.event, odd: Number(b.odd), stake: Number(b.stake), expected_return: Number(b.expected_return),
      result: b.result, received: Number(b.received), notes: b.notes ?? "",
    });
    setEditing(b.id);
    setOpen(true);
  };

  const save = async () => {
    if (!user) return;
    if (!form.event.trim() || !form.bookmaker.trim()) return toast.error("Preencha evento e casa de aposta");
    const profit = calcProfit(Number(form.received), Number(form.stake), form.result);
    const payload = { ...form, profit, user_id: user.id };

    const { error } = editing
      ? await supabase.from("bets").update(payload).eq("id", editing)
      : await supabase.from("bets").insert(payload);
    if (error) return toast.error(error.message);
    toast.success(editing ? "Aposta atualizada" : "Aposta registrada");
    setOpen(false);
    qc.invalidateQueries({ queryKey: ["bets"] });
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("bets").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Aposta removida");
    qc.invalidateQueries({ queryKey: ["bets"] });
  };

  const exportCsv = () => {
    const header = ["Data","Casa","Tipo","Categoria","Evento","Odd","Valor","Retorno esperado","Resultado","Recebido","Lucro","Obs"];
    const rows = filtered.map((b) => [b.bet_date, b.bookmaker, b.bet_type, b.category, b.event, b.odd, b.stake, b.expected_return, b.result, b.received, b.profit, (b.notes ?? "").replace(/[\n,]/g, " ")]);
    const csv = [header, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `apostas-${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Minhas Apostas</h1>
          <p className="text-sm text-muted-foreground">Registre, filtre e analise suas entradas</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportCsv}><Download className="w-4 h-4 mr-1" /> Exportar CSV</Button>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button onClick={openNew} className="gradient-primary border-0"><Plus className="w-4 h-4 mr-1" /> Nova aposta</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader><DialogTitle>{editing ? "Editar aposta" : "Nova aposta"}</DialogTitle></DialogHeader>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Data"><Input type="date" value={form.bet_date} onChange={(e) => setForm({ ...form, bet_date: e.target.value })} /></Field>
                <Field label="Casa de aposta"><Input value={form.bookmaker} onChange={(e) => setForm({ ...form, bookmaker: e.target.value })} placeholder="Bet365, Betano..." /></Field>
                <Field label="Tipo">
                  <Select value={form.bet_type} onValueChange={(v) => setForm({ ...form, bet_type: v as BetType })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="esporte">Esporte</SelectItem><SelectItem value="cassino">Cassino</SelectItem></SelectContent>
                  </Select>
                </Field>
                <Field label="Categoria">
                  <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{ALL_CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select>
                </Field>
                <Field label="Evento / jogo" className="col-span-2"><Input value={form.event} onChange={(e) => setForm({ ...form, event: e.target.value })} placeholder="Brasil x Argentina, Roleta XYZ..." /></Field>
                <Field label="Odd"><Input type="number" step="0.01" value={form.odd} onChange={(e) => setForm({ ...form, odd: Number(e.target.value), expected_return: Number((Number(e.target.value) * form.stake).toFixed(2)) })} /></Field>
                <Field label="Valor apostado"><Input type="number" step="0.01" value={form.stake} onChange={(e) => setForm({ ...form, stake: Number(e.target.value), expected_return: Number((form.odd * Number(e.target.value)).toFixed(2)) })} /></Field>
                <Field label="Retorno esperado"><Input type="number" step="0.01" value={form.expected_return} onChange={(e) => setForm({ ...form, expected_return: Number(e.target.value) })} /></Field>
                <Field label="Resultado">
                  <Select value={form.result} onValueChange={(v) => setForm({ ...form, result: v as BetResult })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{Object.entries(RESULT_LABELS).map(([k, l]) => <SelectItem key={k} value={k}>{l}</SelectItem>)}</SelectContent>
                  </Select>
                </Field>
                <Field label="Valor recebido"><Input type="number" step="0.01" value={form.received} onChange={(e) => setForm({ ...form, received: Number(e.target.value) })} /></Field>
                <Field label="Lucro calculado">
                  <Input value={formatCurrency(calcProfit(form.received, form.stake, form.result))} readOnly className="font-semibold" />
                </Field>
                <Field label="Observação" className="col-span-2"><Textarea value={form.notes ?? ""} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} /></Field>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
                <Button onClick={save} className="gradient-primary border-0">{editing ? "Salvar" : "Registrar"}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card className="card-elevated p-4 rounded-xl">
        <div className="grid md:grid-cols-5 gap-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Buscar evento" value={filters.q} onChange={(e) => setFilters({ ...filters, q: e.target.value })} className="pl-9" />
          </div>
          <SelectFilter value={filters.bookmaker} onChange={(v) => setFilters({ ...filters, bookmaker: v })} options={[["all","Todas as casas"], ...bookmakers.map(b=>[b,b] as [string,string])]} />
          <SelectFilter value={filters.type} onChange={(v) => setFilters({ ...filters, type: v })} options={[["all","Todos os tipos"],["esporte","Esporte"],["cassino","Cassino"]]} />
          <SelectFilter value={filters.category} onChange={(v) => setFilters({ ...filters, category: v })} options={[["all","Todas categorias"], ...ALL_CATEGORIES.map(c=>[c,c] as [string,string])]} />
          <SelectFilter value={filters.result} onChange={(v) => setFilters({ ...filters, result: v })} options={[["all","Todos resultados"], ...Object.entries(RESULT_LABELS)]} />
        </div>
      </Card>

      <Card className="card-elevated rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary/40 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="text-left px-4 py-3">Data</th>
                <th className="text-left px-4 py-3">Evento</th>
                <th className="text-left px-4 py-3">Casa</th>
                <th className="text-left px-4 py-3">Categoria</th>
                <th className="text-right px-4 py-3">Odd</th>
                <th className="text-right px-4 py-3">Valor</th>
                <th className="text-right px-4 py-3">Lucro</th>
                <th className="text-center px-4 py-3">Resultado</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={9} className="text-center py-10 text-muted-foreground text-sm">Nenhuma aposta encontrada</td></tr>
              )}
              {filtered.map((b) => (
                <tr key={b.id} className="border-t border-border hover:bg-secondary/30">
                  <td className="px-4 py-3 whitespace-nowrap">{b.bet_date}</td>
                  <td className="px-4 py-3 max-w-[220px] truncate">{b.event}</td>
                  <td className="px-4 py-3">{b.bookmaker}</td>
                  <td className="px-4 py-3"><Badge variant="outline">{b.category}</Badge></td>
                  <td className="px-4 py-3 text-right font-mono">{Number(b.odd).toFixed(2)}</td>
                  <td className="px-4 py-3 text-right font-mono">{formatCurrency(Number(b.stake))}</td>
                  <td className={`px-4 py-3 text-right font-mono font-semibold ${Number(b.profit) > 0 ? "text-success" : Number(b.profit) < 0 ? "text-destructive" : ""}`}>
                    {formatCurrency(Number(b.profit))}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Badge className={
                      b.result === "green" || b.result === "duplo_green" ? "bg-success/20 text-success border-success/30" :
                      b.result === "red" ? "bg-destructive/20 text-destructive border-destructive/30" :
                      b.result === "pendente" ? "bg-warning/20 text-warning border-warning/30" :
                      "bg-secondary"} variant="outline">{RESULT_LABELS[b.result]}</Badge>
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <Button size="icon" variant="ghost" onClick={() => openEdit(b)}><Pencil className="w-4 h-4" /></Button>
                    <Button size="icon" variant="ghost" onClick={() => remove(b.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function Field({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      <Label className="text-xs">{label}</Label>
      {children}
    </div>
  );
}

function SelectFilter({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: [string, string][] }) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger><SelectValue /></SelectTrigger>
      <SelectContent>{options.map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}</SelectContent>
    </Select>
  );
}
