import { AuthSession } from "./types";

const SESSION_KEY = "dripcheck_session";

function setSessionCookie(userId: string) {
  if (typeof document !== "undefined") {
    document.cookie = `dripcheck_session=${encodeURIComponent(userId)}; path=/; max-age=2592000; SameSite=Lax`;
  }
}

function clearSessionCookie() {
  if (typeof document !== "undefined") {
    document.cookie = `dripcheck_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  }
}

function generateUUID(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return "usr_" + Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
}

export function getSession(): AuthSession | null {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AuthSession;
  } catch {
    return null;
  }
}

export function saveSession(session: AuthSession): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    setSessionCookie(session.user_id);
  } catch (err) {
    console.error("Failed to save session:", err);
  }
}

export async function signIn(email: string, _password: string): Promise<AuthSession> {
  void _password;
  const cleanEmail = email.trim();
  const usernameHandle = cleanEmail.split("@")[0].replace(/[^a-zA-Z0-9_]/g, "_").slice(0, 18);
  const formattedUsername = `u/${usernameHandle || "user"}`;

  const session: AuthSession = {
    user_id: generateUUID(),
    email: cleanEmail,
    username: formattedUsername,
    is_guest: false,
    created_at: new Date().toISOString(),
  };

  saveSession(session);
  return session;
}

export async function signUp(email: string, _password: string, username: string): Promise<AuthSession> {
  void _password;
  let cleanUsername = username.trim();
  if (!cleanUsername.startsWith("u/")) {
    cleanUsername = `u/${cleanUsername}`;
  }

  const session: AuthSession = {
    user_id: generateUUID(),
    email: email.trim(),
    username: cleanUsername,
    is_guest: false,
    created_at: new Date().toISOString(),
  };

  saveSession(session);
  return session;
}

export async function continueAsGuest(): Promise<AuthSession> {
  const randomDigits = Math.floor(1000 + Math.random() * 9000);
  const session: AuthSession = {
    user_id: generateUUID(),
    username: `u/guest_${randomDigits}`,
    is_guest: true,
    created_at: new Date().toISOString(),
  };

  saveSession(session);
  return session;
}

export async function signOut(): Promise<void> {
  if (typeof window !== "undefined") {
    localStorage.removeItem(SESSION_KEY);
    clearSessionCookie();
  }
}

export function getUserId(): string {
  const current = getSession();
  if (current) {
    return current.user_id;
  }
  return "guest_default_id";
}
