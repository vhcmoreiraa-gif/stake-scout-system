export type BetType = "esporte" | "cassino";
export type BetResult = "pendente" | "green" | "red" | "meio_green" | "duplo_green" | "cashout" | "cancelado";

export interface Bet {
  id: string;
  user_id: string;
  bet_date: string;
  bookmaker: string;
  bet_type: BetType;
  category: string;
  event: string;
  odd: number;
  stake: number;
  expected_return: number;
  result: BetResult;
  received: number;
  profit: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface BankrollSettings {
  user_id: string;
  initial_balance: number;
  goal: number;
  daily_limit: number;
  weekly_limit: number;
  monthly_limit: number;
  stop_loss: number;
}

export const SPORT_CATEGORIES = ["Futebol", "Basquete", "Tênis", "Outros Esportes"];
export const CASINO_CATEGORIES = ["Roleta", "Slots", "Crash", "Outros Cassino"];
export const ALL_CATEGORIES = [...SPORT_CATEGORIES, ...CASINO_CATEGORIES];

export const RESULT_LABELS: Record<BetResult, string> = {
  pendente: "Pendente",
  green: "Green",
  red: "Red",
  meio_green: "Meio Green",
  duplo_green: "Duplo Green",
  cashout: "Cashout",
  cancelado: "Cancelado",
};

export function calcProfit(received: number, stake: number, result: BetResult): number {
  if (result === "pendente" || result === "cancelado") return 0;
  return Number((received - stake).toFixed(2));
}

export function formatCurrency(value: number, currency = "BRL") {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency }).format(value || 0);
}

export function formatPercent(value: number) {
  return `${(value || 0).toFixed(2)}%`;
}
