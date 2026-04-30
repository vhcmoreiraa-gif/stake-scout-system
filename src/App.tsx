import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Scanner from "./pages/Scanner";
import Freebet from "./pages/Freebet";
import Calculadora from "./pages/Calculadora";
import MinhasApostas from "./pages/MinhasApostas";
import Estatisticas from "./pages/Estatisticas";
import Bankroll from "./pages/Bankroll";
import Configuracoes from "./pages/Configuracoes";
import JogoResponsavel from "./pages/JogoResponsavel";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
            <Route path="/scanner" element={<ProtectedRoute><Scanner /></ProtectedRoute>} />
            <Route path="/freebet" element={<ProtectedRoute><Freebet /></ProtectedRoute>} />
            <Route path="/calculadora" element={<ProtectedRoute><Calculadora /></ProtectedRoute>} />
            <Route path="/apostas" element={<ProtectedRoute><MinhasApostas /></ProtectedRoute>} />
            <Route path="/estatisticas" element={<ProtectedRoute><Estatisticas /></ProtectedRoute>} />
            <Route path="/bankroll" element={<ProtectedRoute><Bankroll /></ProtectedRoute>} />
            <Route path="/jogo-responsavel" element={<ProtectedRoute><JogoResponsavel /></ProtectedRoute>} />
            <Route path="/configuracoes" element={<ProtectedRoute><Configuracoes /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
