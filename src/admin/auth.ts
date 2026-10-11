const SESSION_KEY = 'l2d-admin-session'

export interface Session {
  token: string
  name: string
  expiresAt: number
}

export function storedSession(): Session | null {
  try {
    const session = JSON.parse(sessionStorage.getItem(SESSION_KEY) ?? 'null') as Session | null
    if (session && session.expiresAt > Date.now()) return session
  } catch {
    // treat unreadable storage as signed out
  }
  sessionStorage.removeItem(SESSION_KEY)
  return null
}

export function storeSession(session: Session) {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session))
}

export function clearSession() {
  sessionStorage.removeItem(SESSION_KEY)
}

export async function requestLogin(apiUrl: string, password: string, name: string): Promise<Session> {
  const res = await fetch(apiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ action: 'login', payload: { password, name } }),
  })
  const body = await res.json()
  if (body.error) throw new Error(body.error)
  return { token: body.token, name: body.name, expiresAt: Date.now() + body.expiresIn * 1000 - 60_000 }
}
