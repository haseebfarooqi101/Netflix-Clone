// Cookie-based auth helpers
// Uses document.cookie directly — no extra deps needed

const COOKIE_NAME = 'netflix_clone_auth'
const REMEMBER_COOKIE = 'netflix_clone_remember'

export function setAuthCookie(rememberMe: boolean) {
  const value = 'authenticated'
  if (rememberMe) {
    // 30 days
    const expires = new Date()
    expires.setDate(expires.getDate() + 30)
    document.cookie = `${COOKIE_NAME}=${value}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`
    document.cookie = `${REMEMBER_COOKIE}=true; expires=${expires.toUTCString()}; path=/; SameSite=Lax`
  } else {
    // Session cookie — expires when browser closes
    document.cookie = `${COOKIE_NAME}=${value}; path=/; SameSite=Lax`
    document.cookie = `${REMEMBER_COOKIE}=false; path=/; SameSite=Lax`
  }
}

export function getAuthCookie(): boolean {
  if (typeof document === 'undefined') return false
  return document.cookie.split(';').some((c) => c.trim().startsWith(`${COOKIE_NAME}=`))
}

export function getRememberMeCookie(): boolean {
  if (typeof document === 'undefined') return false
  return document.cookie.split(';').some((c) => c.trim() === `${REMEMBER_COOKIE}=true`)
}

export function clearAuthCookie() {
  document.cookie = `${COOKIE_NAME}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
  document.cookie = `${REMEMBER_COOKIE}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
}
