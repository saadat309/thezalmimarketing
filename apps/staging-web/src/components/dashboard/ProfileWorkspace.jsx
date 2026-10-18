import { useEffect, useState } from 'react'
import { Loader2, UploadCloud } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { readAdminProfile, updateAdminProfile } from '../../data/admin-api.js'

function Label({ className = '', ...props }) {
  return <label className={`text-sm font-medium leading-none ${className}`} {...props} />
}

export default function ProfileWorkspace() {
  const [profile, setProfile] = useState(null)
  const [draft, setDraft] = useState({ name: '', bio: '' })
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  async function refresh() {
    const result = await readAdminProfile()
    setProfile(result.user)
    setDraft({ name: result.user.name || '', bio: result.user.bio || '' })
  }
  useEffect(() => { refresh().catch((caught) => setError(caught.message)) }, [])

  async function save(event) {
    event.preventDefault()
    setIsLoading(true); setError(''); setNotice('')
    try {
      const result = await updateAdminProfile({ name: draft.name, bio: draft.bio })
      setProfile(result.user); setDraft({ name: result.user.name, bio: result.user.bio }); setIsEditing(false)
      setNotice('Profile updated successfully.')
      window.dispatchEvent(new CustomEvent('staging-admin-profile-updated', { detail: result.user }))
    } catch (caught) { setError(caught.message) } finally { setIsLoading(false) }
  }

  function cancel() { setDraft({ name: profile?.name || '', bio: profile?.bio || '' }); setIsEditing(false); setError('') }

  if (!profile && !error) return <div className="container px-4 py-8 mx-auto lg:px-6" role="status">Loading profile…</div>

  return <div className="container px-4 py-8 mx-auto lg:px-6">
    <h1 className="mb-6 text-3xl font-bold">User Profile</h1>
    {error && <p className="mb-4 text-sm text-red-400" role="alert">{error}</p>}
    {notice && <p className="mb-4 text-sm text-emerald-400" role="status">{notice}</p>}
    <Card className="max-w-2xl mx-auto">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Profile Details</CardTitle>
        {!isEditing ? <Button type="button" onClick={() => { setIsEditing(true); setNotice('') }}>Edit Profile</Button> : <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={cancel} disabled={isLoading}>Cancel</Button>
          <Button type="submit" form="profile-form" disabled={isLoading}>{isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}Save Changes</Button>
        </div>}
      </CardHeader>
      <CardContent className="grid gap-6">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <div role="img" aria-label={`Profile picture for ${draft.name || 'admin'}`} className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted">
              {draft.name ? draft.name.charAt(0).toUpperCase() : 'U'}
            </div>
            {profile?.role_name && !isEditing && <Badge className="absolute bottom-0 right-0 transform translate-x-1/4 translate-y-1/4">{profile.role_name}</Badge>}
          </div>
          <div className="grid gap-1">
            <Label className="text-sm font-medium leading-none">Profile Picture</Label>
            {isEditing && <p className="flex items-center gap-1 text-sm text-muted-foreground"><UploadCloud className="w-4 h-4" aria-hidden="true" />Avatar upload is deferred for staging.</p>}
          </div>
        </div>
        <form id="profile-form" className="grid gap-6" onSubmit={save}>
          <div className="grid gap-2"><Label htmlFor="name">Name</Label><Input id="name" autoComplete="name" value={draft.name} onChange={(event) => setDraft((value) => ({ ...value, name: event.target.value }))} disabled={!isEditing} maxLength={100} required /></div>
          <div className="grid gap-2"><Label htmlFor="email">Email</Label><Input id="email" type="email" value={profile?.email || ''} disabled readOnly /></div>
          <div className="grid gap-2"><Label htmlFor="bio">Bio</Label><Textarea id="bio" value={draft.bio} onChange={(event) => setDraft((value) => ({ ...value, bio: event.target.value }))} disabled={!isEditing} rows={4} maxLength={5000} /></div>
        </form>
      </CardContent>
    </Card>
  </div>
}
