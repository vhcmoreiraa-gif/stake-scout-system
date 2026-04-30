import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { ShieldAlert, AlertTriangle, Pause, Phone } from "lucide-react";
import { toast } from "sonner";

export default function JogoResponsavel() {
  const { user } = useAuth();
  const [pausedUntil, setPausedUntil] = useState<string | null>(null);
  const [days, setDays] = useState("1");

  useEffect(() => {
    if (!user) return;
    supabase.from("user_settings").select("paused_until").maybeSingle().then(({ data }) => {
      setPausedUntil(data?.paused_until ?? null);
    });
  }, [user]);

  const pause = async () => {
    if (!user) return;
    const until = new Date(); until.setDate(until.getDate() + Number(days));
    const { error } = await supabase.from("user_settings").upsert({ user_id: user.id, paused_until: until.toISOString() });
    if (error) return toast.error(error.message);
    setPausedUntil(until.toISOString());
    toast.success(`Pausa ativada até ${until.toLocaleDateString("pt-BR")}`);
  };

  const cancelPause = async () => {
    if (!user) return;
    const { error } = await supabase.from("user_settings").upsert({ user_id: user.id, paused_until: null });
    if (error) return toast.error(error.message);
    setPausedUntil(null);
    toast.success("Pausa cancelada");
  };

  return (
    <div className="space-y-5 max-w-3xl">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-warning/15 text-warning flex items-center justify-center"><ShieldAlert className="w-5 h-5" /></div>
        <div>
          <h1 className="text-2xl font-bold">Jogo Responsável</h1>
          <p className="text-sm text-muted-foreground">Ferramentas para manter o controle</p>
        </div>
      </div>

      <Card className="p-4 rounded-xl border-warning/40 bg-warning/10">
        <div className="flex gap-3">
          <AlertTriangle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
          <div className="text-sm space-y-1">
            <p className="font-semibold">Aviso de risco</p>
            <p className="text-muted-foreground">Apostas envolvem risco de perda financeira. Este sistema é apenas para controle financeiro e organização pessoal — não incentiva apostas. Aposte apenas valores que você pode perder.</p>
          </div>
        </div>
      </Card>

      <Card className="card-elevated p-5 rounded-xl space-y-4">
        <div className="flex items-center gap-2">
          <Pause className="w-4 h-4 text-primary" />
          <h3 className="font-semibold">Pausa temporária</h3>
        </div>
        {pausedUntil ? (
          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-primary/10 border border-primary/30 text-sm">
              Pausa ativa até <strong>{new Date(pausedUntil).toLocaleString("pt-BR")}</strong>
            </div>
            <Button variant="outline" onClick={cancelPause}>Cancelar pausa</Button>
          </div>
        ) : (
          <div className="flex flex-wrap gap-3 items-end">
            <div className="space-y-1.5">
              <p className="text-xs text-muted-foreground">Pausar por</p>
              <Select value={days} onValueChange={setDays}>
                <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 dia</SelectItem>
                  <SelectItem value="3">3 dias</SelectItem>
                  <SelectItem value="7">7 dias</SelectItem>
                  <SelectItem value="30">30 dias</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={pause} className="gradient-primary border-0">Ativar pausa</Button>
          </div>
        )}
      </Card>

      <Card className="card-elevated p-5 rounded-xl space-y-3">
        <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-primary" /><h3 className="font-semibold">Precisa de ajuda?</h3></div>
        <p className="text-sm text-muted-foreground">Se sentir que perdeu o controle, busque apoio:</p>
        <ul className="text-sm space-y-1 list-disc pl-5 text-muted-foreground">
          <li><strong>Jogadores Anônimos Brasil</strong> — jogadoresanonimos.com.br</li>
          <li><strong>CVV</strong> — 188 (24h, gratuito)</li>
          <li><strong>CAPS</strong> — Centros de Atenção Psicossocial</li>
        </ul>
      </Card>
    </div>
  );
}
