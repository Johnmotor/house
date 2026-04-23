const AUTH_KEY = 'bnb_auth';
const PASSWORD = '2026'; // 员工密码 // Simple password for demo

export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(AUTH_KEY) === 'true';
}

export function login(password: string): boolean {
  if (password === PASSWORD) {
    localStorage.setItem(AUTH_KEY, 'true');
    return true;
  }
  return false;
}

export function logout(): void {
  localStorage.removeItem(AUTH_KEY);
}
