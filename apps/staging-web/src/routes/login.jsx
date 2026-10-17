import { useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { LockKeyhole, ShieldCheck } from 'lucide-react'
import { loginAdmin } from '../data/admin-api.js'

export const Route = createFileRoute('/login')({
  validateSearch: (search) => ({ redirect: typeof search.redirect === 'string' ? search.redirect : '/dashboard' }),
  head: () => ({ meta: [{ title: 'Admin Login | Zalmi Marketing Staging' }, { name: 'robots', content: 'noindex, nofollow' }] }),
  component: LoginPage,
})

function LoginPage() {
  const { redirect } = Route.useSearch()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(event) {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      await loginAdmin(email, password)
      const next = redirect.startsWith('/dashboard') && !redirect.startsWith('//') ? redirect : '/dashboard'
      window.location.assign(next)
    } catch (caught) {
      setError(caught.message)
    } finally {
      setBusy(false)
    }
  }

  return <main className="admin-login-page">
    <section className="admin-login-card">
      <div className="admin-login-icon"><LockKeyhole aria-hidden="true" /></div>
      <p className="admin-eyebrow">LOCAL STAGING ONLY</p>
      <h1>Dashboard sign in</h1>
      <p className="admin-muted">Use one of the two synthetic Admin accounts configured on this local API.</p>
      <p className="admin-account-hint">Accounts: <code>admin.one@staging.invalid</code> or <code>admin.two@staging.invalid</code>. Passwords are set only in the ignored local `.dev.vars` file.</p>
      <form onSubmit={submit} className="admin-form">
        <label htmlFor="admin-email">Email address<input id="admin-email" name="email" type="email" autoComplete="username" required value={email} onChange={(event) => setEmail(event.target.value)} /></label>
        <label htmlFor="admin-password">Password<input id="admin-password" name="password" type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} /></label>
        {error && <p className="admin-error" role="alert">{error}</p>}
        <button className="admin-primary-button" type="submit" disabled={busy}>{busy ? 'Signing in…' : 'Sign in securely'}</button>
      </form>
      <p className="admin-safety-note"><ShieldCheck aria-hidden="true" /> Local loopback session · synthetic data · no email or production systems</p>
      <Link className="admin-back-link" to="/">Back to staging website</Link>
    </section>
  </main>
}
