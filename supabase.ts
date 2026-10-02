import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase environment variables. Check .env for VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type HangmanWord = {
  id: string;
  word: string;
  category: string;
  difficulty: string;
  created_at: string;
};

export type HangmanResult = {
  id: string;
  word: string;
  category: string;
  won: boolean;
  wrong_guesses: number;
  hints_used: number;
  player_name: string | null;
  created_at: string;
};

export type Difficulty = "easy" | "medium" | "hard" | "any";
