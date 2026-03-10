// ─── Admin Auth (session-based) ───────────────────────────────────────────────
// Password must be set via VITE_ADMIN_PASSWORD environment variable.

const ADMIN_PASSWORD = (import.meta as any).env?.VITE_ADMIN_PASSWORD as string | undefined;

const SESSION_KEY = 'blog_admin_auth';

export function isAdminAuthenticated(): boolean {
  return sessionStorage.getItem(SESSION_KEY) === 'true';
}

export function loginAdmin(password: string): boolean {
  if (!ADMIN_PASSWORD) return false;
  if (password === ADMIN_PASSWORD) {
    sessionStorage.setItem(SESSION_KEY, 'true');
    return true;
  }
  return false;
}

export function logoutAdmin(): void {
  sessionStorage.removeItem(SESSION_KEY);
}
