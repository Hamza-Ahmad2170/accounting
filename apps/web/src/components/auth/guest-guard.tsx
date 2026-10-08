import { useEffect } from 'react'
import { useNavigate } from 'ra-core'
import { authClient } from '@/lib/auth-client'

export function GuestGuard({
  children,
  redirectTo = '/',
}: {
  children: React.ReactNode
  redirectTo?: string
}) {
  const { data: session, isPending } = authClient.useSession()
  const navigate = useNavigate()

  useEffect(() => {
    if (isPending) return

    if (session) {
      if (session.session.activeOrganizationId) {
        navigate(redirectTo, { replace: true })
      } else {
        navigate('/create-organization', { replace: true })
      }
    }
  }, [session, isPending, navigate, redirectTo])

  if (isPending || session) {
    return null
  }

  return <>{children}</>
}
