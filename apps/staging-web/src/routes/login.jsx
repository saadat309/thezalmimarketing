import { useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { Eye, EyeOff, ShieldCheck } from 'lucide-react'
import { loginAdmin } from '../data/admin-api.js'

export const Route = createFileRoute('/login')({
  validateSearch: (search) => ({ redirect: typeof search.redirect === 'string' ? search.redirect : '/dashboard' }),
  head: () => ({ meta: [{ title: 'Login | The Zalmi Marketing' }, { name: 'robots', content: 'noindex, nofollow' }] }),
  component: LoginPage,
})

function LoginPage() {
  const { redirect } = Route.useSearch()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
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

  return <main className="staging-admin-login grid min-h-svh bg-primary text-black lg:grid-cols-2">
    <section className="flex flex-col gap-4 p-6 md:p-10">
      <div className="flex justify-center gap-2 md:justify-start"><Link to="/" className="flex items-center gap-2 font-medium"><img src="/Zalmi Marketing Logo White.webp" alt="The Zalmi Marketing Logo" className="h-14 w-auto" /></Link></div>
      <div className="flex flex-1 items-center justify-center">
        <div className="staging-admin-login-card w-full max-w-xs rounded-lg bg-card p-6 shadow-lg">
          <form onSubmit={submit} className="flex flex-col gap-6">
            <div className="flex flex-col items-center gap-2 text-center"><h1 className="text-2xl font-bold">Login to your account</h1><p className="text-balance text-sm text-black/80">Enter your email below to login to your account</p></div>
            <div className="grid gap-6">
              <div className="grid gap-2"><label htmlFor="admin-email" className="text-sm font-medium">Email</label><input id="admin-email" name="email" type="email" autoComplete="username" placeholder="m@example.com" required value={email} onChange={(event) => setEmail(event.target.value)} /></div>
              <div className="grid gap-2"><div className="flex items-center"><label htmlFor="admin-password" className="text-sm font-medium">Password</label></div><div className="staging-password-control"><input id="admin-password" name="password" autoComplete="current-password" type={showPassword ? 'text' : 'password'} required value={password} onChange={(event) => setPassword(event.target.value)} /><button type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword((value) => !value)}>{showPassword ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}</button></div></div>
              {error && <p className="staging-login-error" role="alert">{error}</p>}
              <button type="submit" className="staging-login-submit" disabled={busy}>{busy ? 'Logging in…' : 'Login'}</button>
            </div>
            <p className="staging-login-safety"><ShieldCheck aria-hidden="true" /> Local synthetic staging login. No production account or email service is used.</p>
          </form>
        </div>
      </div>
    </section>
    <div className="staging-login-art relative hidden bg-muted lg:block"><img src="/login_page.webp" alt="Zalmi Marketing property and investment advisory" className="absolute inset-0 h-full w-full object-cover" /></div>
  </main>
}
