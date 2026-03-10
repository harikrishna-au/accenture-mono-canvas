// ─── Admin Auth (hardcoded, session-based) ────────────────────────────────────
// No backend role setup needed. Password stored in env var.

const ADMIN_PASSWORD =
  (import.meta as any).env?.VITE_ADMIN_PASSWORD ?? 'htb-admin-2026';

const SESSION_KEY = 'blog_admin_auth';

export function isAdminAuthenticated(): boolean {
  return sessionStorage.getItem(SESSION_KEY) === 'true';
}

export function loginAdmin(password: string): boolean {
  if (password === ADMIN_PASSWORD) {
    sessionStorage.setItem(SESSION_KEY, 'true');
    return true;
  }
  return false;
}

export function logoutAdmin(): void {
  sessionStorage.removeItem(SESSION_KEY);
}
