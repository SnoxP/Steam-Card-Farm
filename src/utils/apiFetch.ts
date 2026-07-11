export function getSessionId(): string {
  try {
    let sid = localStorage.getItem('app_session_id');
    if (!sid) {
      sid = Math.random().toString(36).substring(2, 15);
      localStorage.setItem('app_session_id', sid);
    }
    return sid;
  } catch (e) {
    if (!(window as any)._tempSessionId) {
      (window as any)._tempSessionId = Math.random().toString(36).substring(2, 15);
    }
    return (window as any)._tempSessionId;
  }
}

export function safeGetItem(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch (e) {
    return null;
  }
}

export function safeSetItem(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch (e) {}
}

export function safeRemoveItem(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (e) {}
}

export async function apiFetch(resource: string | Request | URL, config: RequestInit = {}): Promise<Response> {
  const finalConfig = { ...config };
  if (!finalConfig.headers) {
    finalConfig.headers = {};
  }
  
  // Clone or cast headers to customize
  const headers = { ...((finalConfig.headers as Record<string, string>) || {}) };
  headers['x-session-id'] = getSessionId();
  finalConfig.headers = headers;

  return window.fetch(resource, finalConfig);
}
