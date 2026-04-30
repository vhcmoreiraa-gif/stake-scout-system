import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RefreshCw, Search, Zap, AlertTriangle, TrendingUp } from "lucide-react";
import { formatCurrency, formatPercent } from "@/lib/bets";
import { toast } from "sonner";

const MOCK = [
  { id: 1, sport: "Futebol", event: "Manchester City vs Arsenal", market: "Mais de 2.5 gols", bookmaker: "Bet365", odd: 1.85, value: 8.4, type: "Value" },
  { id: 2, sport: "Tênis", event: "Sinner vs Alcaraz", market: "Sinner vence", bookmaker: "Betano", odd: 2.10, value: 12.5, type: "Surebet" },
  { id: 3, sport: "Basquete", event: "Lakers vs Celtics", market: "Lakers +5.5", bookmaker: "Sportingbet", odd: 1.92, value: 5.2, type: "Value" },
  { id: 4, sport: "Futebol", event: "Real Madrid vs Barcelona", market: "Ambas marcam", bookmaker: "KTO", odd: 1.72, value: 4.8, type: "Value" },
  { id: 5, sport: "Futebol", event: "PSG vs Lyon", market: "PSG -1.5", bookmaker: "Betfair", odd: 2.05, value: 9.1, type: "Surebet" },
  { id: 6, sport: "Tênis", event: "Djokovic vs Medvedev", market: "Over 22.5 games", bookmaker: "Bet365", odd: 1.95, value: 6.3, type: "Value" },
];

export default function Scanner() {
  const [sport, setSport] = useState("all");
  const [bookmaker, setBookmaker] = useState("all");
  const [q, setQ] = useState("");
  const [updating, setUpdating] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  const filtered = MOCK.filter((o) => {
    if (sport !== "all" && o.sport !== sport) return false;
    if (bookmaker !== "all" && o.bookmaker !== bookmaker) return false;
    if (q && !o.event.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  const sync = () => {
    setUpdating(true);
    setTimeout(() => { setUpdating(false); setLastUpdate(new Date()); toast.success("Dados sincronizados"); }, 900);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Scanner de oportunidades</h1>
          <p className="text-sm text-muted-foreground">Última atualização: {lastUpdate.toLocaleTimeString("pt-BR")}</p>
        </div>
        <Button onClick={sync} disabled={updating} className="gradient-primary border-0">
          <RefreshCw className={`w-4 h-4 mr-1 ${updating ? "animate-spin" : ""}`} /> Sincronizar
        </Button>
      </div>

      <Card className="p-3 rounded-xl border-warning/30 bg-warning/10 flex items-start gap-2 text-sm">
        <AlertTriangle className="w-4 h-4 text-warning mt-0.5 shrink-0" />
        <span><strong>Dados demonstrativos.</strong> Valide as informações antes de qualquer decisão.</span>
      </Card>

      <Card className="card-elevated p-4 rounded-xl">
        <div className="grid md:grid-cols-3 gap-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Buscar evento" value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" />
          </div>
          <Select value={sport} onValueChange={setSport}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os esportes</SelectItem>
              <SelectItem value="Futebol">Futebol</SelectItem>
              <SelectItem value="Basquete">Basquete</SelectItem>
              <SelectItem value="Tênis">Tênis</SelectItem>
            </SelectContent>
          </Select>
          <Select value={bookmaker} onValueChange={setBookmaker}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as casas</SelectItem>
              {Array.from(new Set(MOCK.map((m) => m.bookmaker))).map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </Card>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map((o) => (
          <Card key={o.id} className="card-elevated p-4 rounded-xl hover:border-primary/40 transition-colors">
            <div className="flex items-start justify-between gap-2 mb-3">
              <Badge variant="outline" className="gap-1 text-[10px]"><Zap className="w-3 h-3" />{o.type}</Badge>
              <Badge className="bg-success/15 text-success border-success/30" variant="outline">+{formatPercent(o.value)}</Badge>
            </div>
            <h4 className="font-semibold leading-snug mb-1">{o.event}</h4>
            <p className="text-xs text-muted-foreground mb-3">{o.sport} · {o.market}</p>
            <div className="flex items-center justify-between pt-3 border-t border-border">
              <div>
                <p className="text-[10px] text-muted-foreground uppercase">{o.bookmaker}</p>
                <p className="font-mono font-bold text-primary">{o.odd.toFixed(2)}</p>
              </div>
              <Button size="sm" variant="outline"><TrendingUp className="w-3.5 h-3.5 mr-1" /> Analisar</Button>
            </div>
          </Card>
        ))}
        {filtered.length === 0 && (
          <Card className="card-elevated p-8 rounded-xl text-center text-sm text-muted-foreground col-span-full">
            Nenhuma oportunidade encontrada com os filtros atuais.
          </Card>
        )}
      </div>
    </div>
  );
}
