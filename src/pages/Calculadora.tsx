import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCurrency, formatPercent } from "@/lib/bets";

export default function Calculadora() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Calculadora</h1>
        <p className="text-sm text-muted-foreground">Ferramentas para planejar suas entradas</p>
      </div>
      <Tabs defaultValue="simples">
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="simples">Aposta simples</TabsTrigger>
          <TabsTrigger value="roi">ROI</TabsTrigger>
          <TabsTrigger value="hedge">Hedge</TabsTrigger>
          <TabsTrigger value="surebet">Surebet</TabsTrigger>
          <TabsTrigger value="freebet">Freebet</TabsTrigger>
        </TabsList>
        <TabsContent value="simples"><CalcSimples /></TabsContent>
        <TabsContent value="roi"><CalcRoi /></TabsContent>
        <TabsContent value="hedge"><CalcHedge /></TabsContent>
        <TabsContent value="surebet"><CalcSurebet /></TabsContent>
        <TabsContent value="freebet"><CalcFreebet /></TabsContent>
      </Tabs>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1.5"><Label className="text-xs">{label}</Label>{children}</div>;
}
function Result({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className={`p-3 rounded-lg ${accent ? "gradient-primary text-primary-foreground" : "bg-secondary/50"}`}>
      <p className="text-xs opacity-80">{label}</p>
      <p className="text-xl font-bold mt-1">{value}</p>
    </div>
  );
}

function CalcSimples() {
  const [stake, setStake] = useState(100); const [odd, setOdd] = useState(2);
  const ret = stake * odd; const profit = ret - stake;
  return (
    <Card className="card-elevated p-5 rounded-xl mt-4 space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Field label="Valor apostado"><Input type="number" value={stake} onChange={(e) => setStake(Number(e.target.value))} /></Field>
        <Field label="Odd"><Input type="number" step="0.01" value={odd} onChange={(e) => setOdd(Number(e.target.value))} /></Field>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Result label="Retorno total" value={formatCurrency(ret)} />
        <Result label="Lucro" value={formatCurrency(profit)} accent />
      </div>
    </Card>
  );
}

function CalcRoi() {
  const [stake, setStake] = useState(1000); const [profit, setProfit] = useState(150);
  const roi = stake > 0 ? (profit / stake) * 100 : 0;
  return (
    <Card className="card-elevated p-5 rounded-xl mt-4 space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Field label="Investido"><Input type="number" value={stake} onChange={(e) => setStake(Number(e.target.value))} /></Field>
        <Field label="Lucro"><Input type="number" value={profit} onChange={(e) => setProfit(Number(e.target.value))} /></Field>
      </div>
      <Result label="ROI" value={formatPercent(roi)} accent />
    </Card>
  );
}

function CalcHedge() {
  const [stake1, setStake1] = useState(100); const [odd1, setOdd1] = useState(2.5); const [odd2, setOdd2] = useState(1.8);
  const stake2 = (stake1 * odd1) / odd2;
  const profit = stake1 * odd1 - stake1 - stake2;
  return (
    <Card className="card-elevated p-5 rounded-xl mt-4 space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <Field label="Stake 1"><Input type="number" value={stake1} onChange={(e) => setStake1(Number(e.target.value))} /></Field>
        <Field label="Odd 1"><Input type="number" step="0.01" value={odd1} onChange={(e) => setOdd1(Number(e.target.value))} /></Field>
        <Field label="Odd 2 (hedge)"><Input type="number" step="0.01" value={odd2} onChange={(e) => setOdd2(Number(e.target.value))} /></Field>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Result label="Stake 2 sugerida" value={formatCurrency(stake2)} />
        <Result label="Lucro garantido" value={formatCurrency(profit)} accent />
      </div>
    </Card>
  );
}

function CalcSurebet() {
  const [total, setTotal] = useState(1000); const [odd1, setOdd1] = useState(2.1); const [odd2, setOdd2] = useState(2.05);
  const inv = 1/odd1 + 1/odd2;
  const stake1 = total * (1/odd1) / inv; const stake2 = total * (1/odd2) / inv;
  const ret = stake1 * odd1; const profit = ret - total;
  const isSure = inv < 1;
  return (
    <Card className="card-elevated p-5 rounded-xl mt-4 space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <Field label="Total"><Input type="number" value={total} onChange={(e) => setTotal(Number(e.target.value))} /></Field>
        <Field label="Odd A"><Input type="number" step="0.01" value={odd1} onChange={(e) => setOdd1(Number(e.target.value))} /></Field>
        <Field label="Odd B"><Input type="number" step="0.01" value={odd2} onChange={(e) => setOdd2(Number(e.target.value))} /></Field>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <Result label="Stake A" value={formatCurrency(stake1)} />
        <Result label="Stake B" value={formatCurrency(stake2)} />
        <Result label={isSure ? "Lucro garantido" : "Sem arbitragem"} value={isSure ? formatCurrency(profit) : formatPercent((inv-1)*100)} accent={isSure} />
      </div>
    </Card>
  );
}

function CalcFreebet() {
  const [freebet, setFreebet] = useState(100); const [oddBack, setOddBack] = useState(3); const [oddLay, setOddLay] = useState(3.05); const [comm, setComm] = useState(0);
  const layStake = (freebet * (oddBack - 1)) / (oddLay - comm/100);
  const profit = freebet * (oddBack - 1) - layStake * (oddLay - 1);
  const conversion = (profit / freebet) * 100;
  return (
    <Card className="card-elevated p-5 rounded-xl mt-4 space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Field label="Valor da freebet"><Input type="number" value={freebet} onChange={(e) => setFreebet(Number(e.target.value))} /></Field>
        <Field label="Odd back"><Input type="number" step="0.01" value={oddBack} onChange={(e) => setOddBack(Number(e.target.value))} /></Field>
        <Field label="Odd lay"><Input type="number" step="0.01" value={oddLay} onChange={(e) => setOddLay(Number(e.target.value))} /></Field>
        <Field label="Comissão (%)"><Input type="number" step="0.01" value={comm} onChange={(e) => setComm(Number(e.target.value))} /></Field>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <Result label="Lay sugerido" value={formatCurrency(layStake)} />
        <Result label="Lucro" value={formatCurrency(profit)} accent />
        <Result label="Conversão" value={formatPercent(conversion)} />
      </div>
    </Card>
  );
}
