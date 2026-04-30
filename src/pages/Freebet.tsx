import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCurrency, formatPercent } from "@/lib/bets";
import { Repeat, ArrowRight } from "lucide-react";

export default function Freebet() {
  const [freebet, setFreebet] = useState(100);
  const [oddBack, setOddBack] = useState(3);
  const [oddLay, setOddLay] = useState(3.05);
  const [comm, setComm] = useState(0);

  const layStake = (freebet * (oddBack - 1)) / (oddLay - comm / 100);
  const liability = layStake * (oddLay - 1);
  const profit = freebet * (oddBack - 1) - liability;
  const conversion = (profit / freebet) * 100;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Converter Freebet</h1>
        <p className="text-sm text-muted-foreground">Calcule a melhor forma de aproveitar bônus</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card className="card-elevated p-5 rounded-xl space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-primary/15 text-primary flex items-center justify-center"><Repeat className="w-4 h-4" /></div>
            <h3 className="font-semibold">Parâmetros</h3>
          </div>
          <Field label="Valor da freebet"><Input type="number" value={freebet} onChange={(e) => setFreebet(Number(e.target.value))} /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Odd back (casa)"><Input type="number" step="0.01" value={oddBack} onChange={(e) => setOddBack(Number(e.target.value))} /></Field>
            <Field label="Odd lay (exchange)"><Input type="number" step="0.01" value={oddLay} onChange={(e) => setOddLay(Number(e.target.value))} /></Field>
          </div>
          <Field label="Comissão exchange (%)"><Input type="number" step="0.01" value={comm} onChange={(e) => setComm(Number(e.target.value))} /></Field>
        </Card>

        <Card className="card-elevated p-5 rounded-xl space-y-3">
          <h3 className="font-semibold flex items-center gap-2">Resultado <ArrowRight className="w-4 h-4 text-primary" /></h3>
          <Box label="Lay sugerido" value={formatCurrency(layStake)} />
          <Box label="Responsabilidade" value={formatCurrency(liability)} />
          <Box label="Lucro garantido" value={formatCurrency(profit)} highlight />
          <Box label="Taxa de conversão" value={formatPercent(conversion)} highlight={conversion > 0} />
        </Card>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1.5"><Label className="text-xs">{label}</Label>{children}</div>;
}
function Box({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`p-3 rounded-lg ${highlight ? "gradient-primary text-primary-foreground" : "bg-secondary/50"}`}>
      <p className="text-xs opacity-80">{label}</p>
      <p className="text-xl font-bold mt-1">{value}</p>
    </div>
  );
}
