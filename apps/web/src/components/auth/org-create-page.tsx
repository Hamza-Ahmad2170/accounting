import { useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import {
  Form,
  required,
  useNavigate,
  useNotificationContext,
  useNotify,
} from 'ra-core'
import type { SubmitHandler, FieldValues } from 'react-hook-form'
import { customAlphabet } from 'nanoid'
import slugifyLib from 'slugify'

import { Button } from '@/components/ui/button'
import { TextInput } from '@/components/admin/text-input'
import { authClient } from '@/lib/auth-client'
import { AuthShell } from './auth-shell'
import { AuthFormLayout } from './form-layout'

const randomSuffix = customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789', 8)

function buildSlug(name: string, suffix: string) {
  const base = slugifyLib(name, { lower: true, strict: true })

  return base ? `${base}-${suffix}` : suffix
}

export function CreateOrganizationPage(props: { redirectTo?: string }) {
  const { redirectTo } = props
  const [loading, setLoading] = useState(false)
  const notify = useNotify()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { resetNotifications } = useNotificationContext()

  const { data: session, isPending } = authClient.useSession()

  useEffect(() => {
    if (isPending) return

    if (!session) {
      navigate('/login', { replace: true })
    } else if (session.session.activeOrganizationId) {
      navigate(redirectTo || '/', { replace: true })
    }
  }, [session, isPending, navigate, redirectTo])

  if (isPending || !session || session.session.activeOrganizationId) {
    return null
  }

  const handleSubmit: SubmitHandler<FieldValues> = async (values) => {
    setLoading(true)
    const name = String(values.name ?? '')

    // Better Auth's client resolves `{ data, error }` for API failures, but a
    // transport failure still rejects, so both branches are handled.
    const { error } = await authClient.organization
      .create({
        name,
        slug: buildSlug(name, randomSuffix()),
      })
      .catch(() => ({ error: { message: 'Could not reach the server' } }))

    if (error) {
      setLoading(false)
      notify(error.message || 'Could not create your organization', {
        type: 'error',
      })
      return
    }

    /*
     * `createOrganization` flips the session to the new org server-side
     * (`better-auth` calls `setActiveOrganization` on the session), so the
     * API's `requireOrg` gate passes on the very next request — no separate
     * "set active" call is needed.
     *
     * react-admin does not know that yet. Its gate is the cached react-query
     * entry `['auth', 'checkAuth', {}]`, which read the *orgless* session the
     * moment this page was reached. Invalidating the `['auth']` prefix drops
     * that stale reading (plus `getIdentity`/`getPermissions`) before we
     * navigate, so `/` passes the gate instead of bouncing straight back
     * here.
     */
    resetNotifications()
    queryClient.invalidateQueries({ queryKey: ['auth'] })
    navigate(redirectTo || '/', { replace: true })
  }

  return (
    <AuthShell>
      <AuthFormLayout
        title="Create your organization"
        subtitle="This is the workspace your books and parties will live in."
      >
        <Form className="flex flex-col gap-6" onSubmit={handleSubmit}>
          <div className="space-y-7">
            <TextInput
              label="name"
              source="name"
              autoComplete="organization"
              autoFocus
              validate={required()}
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Creating…' : 'Create organization'}
          </Button>
        </Form>
      </AuthFormLayout>
    </AuthShell>
  )
}
