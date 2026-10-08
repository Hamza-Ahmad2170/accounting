import { createFileRoute } from '@tanstack/react-router'

import { CustomRoutes, Resource } from 'ra-core'
import { tanStackRouterProvider } from 'ra-router-tanstack'
import { Admin } from '@/components/admin'
import { authProvider } from '@/lib/authProvider'
import {
  CreateOrganizationPage,
  GuestGuard,
  LoginPage,
  SignupPage,
} from '@/components/auth'

const { Route: RouterRoute } = tanStackRouterProvider

export const Route = createFileRoute('/')({ component: App })

const GuardedLoginPage = (props: { redirectTo?: string }) => (
  <GuestGuard redirectTo={props.redirectTo}>
    <LoginPage {...props} />
  </GuestGuard>
)

const GuardedSignupPage = (props: { redirectTo?: string }) => (
  <GuestGuard redirectTo={props.redirectTo}>
    <SignupPage {...props} />
  </GuestGuard>
)

export function App() {
  return (
    <Admin
      routerProvider={tanStackRouterProvider}
      authProvider={authProvider}
      loginPage={GuardedLoginPage}
    >
      <Resource name="parties" />
      <CustomRoutes noLayout>
        <RouterRoute path="/register" element={<GuardedSignupPage />} />
        <RouterRoute
          path="/create-organization"
          element={<CreateOrganizationPage />}
        />
      </CustomRoutes>
    </Admin>
  )
}
