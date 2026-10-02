import { createFileRoute } from '@tanstack/react-router'
import { CustomRoutes } from 'ra-core'
import { tanStackRouterProvider } from 'ra-router-tanstack'
import { Admin } from '@/components/admin'
import { authProvider } from '@/lib/authProvider'
import {
  CreateOrganizationPage,
  LoginPage,
  SignupPage,
} from '#/components/auth'

const { Route: RouterRoute } = tanStackRouterProvider

export const Route = createFileRoute('/')({ component: App })

export function App() {
  return (
    <Admin
      routerProvider={tanStackRouterProvider}
      authProvider={authProvider}
      loginPage={LoginPage}
    >
      <CustomRoutes noLayout>
        <RouterRoute path="/register" element={<SignupPage />} />
        <RouterRoute
          path="/create-organization"
          element={<CreateOrganizationPage />}
        />
      </CustomRoutes>
    </Admin>
  )
}
