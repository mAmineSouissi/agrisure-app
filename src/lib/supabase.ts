import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Récupérer les variables d'environnement avec des valeurs par défaut pour le build
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Fonction pour vérifier si les variables d'environnement sont configurées
export const isSupabaseConfigured = (): boolean => {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL && 
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
    process.env.NEXT_PUBLIC_SUPABASE_URL !== "https://placeholder.supabase.co" &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== "placeholder-anon-key"
  );
};

// Client pour le côté client
export const supabase: SupabaseClient = createClient(
  supabaseUrl,
  supabaseAnonKey
);

// Client pour le serveur (avec service role key)
export const supabaseAdmin: SupabaseClient | null = supabaseServiceRoleKey
  ? createClient(supabaseUrl, supabaseServiceRoleKey)
  : null;
