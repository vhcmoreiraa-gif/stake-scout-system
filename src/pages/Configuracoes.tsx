import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { LogOut, Moon, Sun } from "lucide-react";

export default function Configuracoes() {
  const { user, signOut } = useAuth();
  const qc = useQueryClient();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [currency, setCurrency] = useState("BRL");
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [notifications, setNotifications] = useState(true);
  const [pwd, setPwd] = useState("");

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: p } = await supabase.from("profiles").select("*").maybeSingle();
      const { data: s } = await supabase.from("user_settings").select("*").maybeSingle();
      if (p) { setName(p.display_name ?? ""); setCurrency(p.currency ?? "BRL"); }
      if (s) { setTheme((s.theme as "dark" | "light") ?? "dark"); setNotifications(s.notifications ?? true); }
    })();
  }, [user]);

  useEffect(() => {
    document.documentElement.classList.toggle("light", theme === "light");
  }, [theme]);

  const saveProfile = async () => {
    if (!user) return;
    const { error } = await supabase.from("profiles").update({ display_name: name, currency }).eq("id", user.id);
    if (error) return toast.error(error.message);
    toast.success("Perfil atualizado");
    qc.invalidateQueries();
  };

  const saveSettings = async () => {
    if (!user) return;
    const { error } = await supabase.from("user_settings").upsert({ user_id: user.id, theme, notifications });
    if (error) return toast.error(error.message);
    toast.success("Preferências salvas");
  };

  const changePwd = async () => {
    if (pwd.length < 6) return toast.error("Senha precisa ter ao menos 6 caracteres");
    const { error } = await supabase.auth.updateUser({ password: pwd });
    if (error) return toast.error(error.message);
    setPwd(""); toast.success("Senha alterada");
  };

  return (
    <div className="space-y-5 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold">Configurações</h1>
        <p className="text-sm text-muted-foreground">Personalize sua conta e preferências</p>
      </div>

      <Card className="card-elevated p-5 rounded-xl space-y-4">
        <h3 className="font-semibold">Perfil</h3>
        <div className="grid md:grid-cols-2 gap-3">
          <Field label="Nome"><Input value={name} onChange={(e) => setName(e.target.value)} /></Field>
          <Field label="E-mail"><Input value={user?.email ?? ""} disabled /></Field>
          <Field label="Moeda">
            <Select value={currency} onValueChange={setCurrency}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="BRL">Real (BRL)</SelectItem>
                <SelectItem value="USD">Dólar (USD)</SelectItem>
                <SelectItem value="EUR">Euro (EUR)</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        </div>
        <Button onClick={saveProfile} className="gradient-primary border-0">Salvar perfil</Button>
      </Card>

      <Card className="card-elevated p-5 rounded-xl space-y-4">
        <h3 className="font-semibold">Preferências</h3>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {theme === "dark" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            <span className="text-sm">Tema {theme === "dark" ? "escuro" : "claro"}</span>
          </div>
          <Switch checked={theme === "dark"} onCheckedChange={(c) => setTheme(c ? "dark" : "light")} />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm">Notificações</span>
          <Switch checked={notifications} onCheckedChange={setNotifications} />
        </div>
        <Button onClick={saveSettings} className="gradient-primary border-0">Salvar preferências</Button>
      </Card>

      <Card className="card-elevated p-5 rounded-xl space-y-4">
        <h3 className="font-semibold">Alterar senha</h3>
        <Field label="Nova senha"><Input type="password" value={pwd} onChange={(e) => setPwd(e.target.value)} /></Field>
        <Button onClick={changePwd} variant="outline">Atualizar senha</Button>
      </Card>

      <Card className="card-elevated p-5 rounded-xl flex items-center justify-between">
        <div>
          <h3 className="font-semibold">Sair da conta</h3>
          <p className="text-xs text-muted-foreground">Você precisará entrar novamente para acessar seus dados.</p>
        </div>
        <Button variant="destructive" onClick={async () => { await signOut(); navigate("/auth"); }}>
          <LogOut className="w-4 h-4 mr-1" /> Sair
        </Button>
      </Card>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1.5"><Label className="text-xs">{label}</Label>{children}</div>;
}
