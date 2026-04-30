import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { z } from "zod";
import { TrendingUp, Mail, Lock, User as UserIcon, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const emailSchema = z.string().trim().email("E-mail inválido").max(255);
const passwordSchema = z.string().min(6, "Mínimo 6 caracteres").max(72);
const nameSchema = z.string().trim().min(2, "Mínimo 2 caracteres").max(60);

export default function Auth() {
  const { user, loading, signIn, signUp, resetPassword } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup" | "reset">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (loading) return null;
  if (user) return <Navigate to="/" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (mode === "reset") {
        const v = emailSchema.safeParse(email);
        if (!v.success) return toast.error(v.error.issues[0].message);
        const { error } = await resetPassword(email);
        if (error) toast.error(error);
        else toast.success("Verifique seu e-mail para redefinir a senha.");
        setMode("login");
        return;
      }
      const ev = emailSchema.safeParse(email);
      const pv = passwordSchema.safeParse(password);
      if (!ev.success) return toast.error(ev.error.issues[0].message);
      if (!pv.success) return toast.error(pv.error.issues[0].message);

      if (mode === "signup") {
        const nv = nameSchema.safeParse(name);
        if (!nv.success) return toast.error(nv.error.issues[0].message);
        const { error } = await signUp(email, password, name);
        if (error) toast.error(error);
        else {
          toast.success("Conta criada! Você já pode entrar.");
          navigate("/");
        }
      } else {
        const { error } = await signIn(email, password);
        if (error) toast.error(error);
        else navigate("/");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-accent/10 blur-3xl" />
      </div>

      <div className="w-full max-w-md card-elevated rounded-2xl p-8 animate-fade-in">
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center glow-primary mb-4">
            <TrendingUp className="w-7 h-7 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold">BetControl <span className="text-gradient">Pro</span></h1>
          <p className="text-sm text-muted-foreground mt-1">Gestão Inteligente de Apostas</p>
        </div>

        {mode !== "reset" ? (
          <Tabs value={mode} onValueChange={(v) => setMode(v as "login" | "signup")}>
            <TabsList className="grid grid-cols-2 w-full mb-6">
              <TabsTrigger value="login">Entrar</TabsTrigger>
              <TabsTrigger value="signup">Criar conta</TabsTrigger>
            </TabsList>

            <TabsContent value={mode}>
              <form onSubmit={handleSubmit} className="space-y-4">
                {mode === "signup" && (
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome</Label>
                    <div className="relative">
                      <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="pl-10" placeholder="Seu nome" />
                    </div>
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10" placeholder="voce@email.com" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10" placeholder="••••••••" />
                  </div>
                </div>
                <Button type="submit" disabled={submitting} className="w-full gradient-primary border-0 text-primary-foreground hover:opacity-90">
                  {mode === "login" ? "Entrar" : "Criar conta"} <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
                {mode === "login" && (
                  <button type="button" onClick={() => setMode("reset")} className="text-xs text-muted-foreground hover:text-primary w-full text-center">
                    Esqueci minha senha
                  </button>
                )}
              </form>
            </TabsContent>
          </Tabs>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="text-lg font-semibold">Recuperar senha</h2>
            <div className="space-y-2">
              <Label htmlFor="email-r">E-mail</Label>
              <Input id="email-r" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="voce@email.com" />
            </div>
            <Button type="submit" disabled={submitting} className="w-full gradient-primary border-0">Enviar link</Button>
            <button type="button" onClick={() => setMode("login")} className="text-xs text-muted-foreground hover:text-primary w-full text-center">
              Voltar ao login
            </button>
          </form>
        )}

        <p className="text-[10px] text-muted-foreground text-center mt-6 leading-relaxed">
          Este sistema é apenas para controle financeiro e organização pessoal. Aposte com responsabilidade.
        </p>
      </div>
    </div>
  );
}
