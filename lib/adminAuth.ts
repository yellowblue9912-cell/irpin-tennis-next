import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const ADMIN_COOKIE_NAME = "irpintennis_admin";

function hash(value: string) {
  return createHash("sha256").update(value).digest();
}

function safeEqual(left: string, right: string) {
  return timingSafeEqual(hash(left), hash(right));
}

function getConfig() {
  return {
    username: process.env.ADMIN_USERNAME ?? "",
    password: process.env.ADMIN_PASSWORD ?? "",
    secret: process.env.ADMIN_SESSION_SECRET ?? "",
  };
}

export function adminAuthConfigured() {
  const config = getConfig();
  return Boolean(config.username && config.password && config.secret);
}

export function validateAdminCredentials(username: string, password: string) {
  const config = getConfig();

  if (!adminAuthConfigured()) return false;

  return (
    safeEqual(username, config.username) &&
    safeEqual(password, config.password)
  );
}

export function createAdminSessionToken() {
  const config = getConfig();
  return createHmac("sha256", config.secret)
    .update(`admin:${config.username}`)
    .digest("hex");
}

export async function isAdminAuthenticated() {
  if (!adminAuthConfigured()) return false;

  const cookieStore = await cookies();
  const actualToken = cookieStore.get(ADMIN_COOKIE_NAME)?.value;

  if (!actualToken) return false;

  return safeEqual(actualToken, createAdminSessionToken());
}
