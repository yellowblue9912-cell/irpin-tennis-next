import { createClient } from "@supabase/supabase-js";

export function createAdminSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error("Серверний ключ Supabase не налаштований");
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export async function findAuthUserByEmail(email: string) {
  const supabase = createAdminSupabaseClient();
  const normalizedEmail = email.trim().toLowerCase();
  const { data, error } = await supabase.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });

  if (error) {
    throw new Error(`Не вдалося перевірити email: ${error.message}`);
  }

  return (
    data.users.find(
      (user) => user.email?.trim().toLowerCase() === normalizedEmail,
    ) ?? null
  );
}

export async function getAuthUserEmail(userId: string | null) {
  if (!userId) return "";

  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase.auth.admin.getUserById(userId);

  if (error) {
    throw new Error(`Не вдалося завантажити email: ${error.message}`);
  }

  return data.user.email ?? "";
}
