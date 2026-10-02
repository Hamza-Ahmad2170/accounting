import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import {
  FieldTitle,
  Form,
  LinkBase,
  minLength,
  required,
  useInput,
  useNavigate,
  useNotificationContext,
  useNotify,
} from 'ra-core'
import type { Validator } from 'ra-core'
import type { SubmitHandler, FieldValues } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FieldDescription, FieldSeparator } from '@/components/ui/field'
import {
  FormControl,
  FormError,
  FormField,
  FormLabel,
} from '@/components/admin/form'
import { TextInput } from '@/components/admin/text-input'
import { authClient } from '@/lib/auth-client'
import { AuthShell } from './auth-shell'

/**
 * Google's brand mark. Not in lucide, which ships no third-party logos.
 */
const GoogleMark = (props: React.ComponentProps<'svg'>) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
    <path
      fill="#4285F4"
      d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47a5.54 5.54 0 0 1-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82Z"
    />
    <path
      fill="#34A853"
      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09A12 12 0 0 0 12 24Z"
    />
    <path
      fill="#FBBC05"
      d="M5.27 14.29a7.2 7.2 0 0 1 0-4.58V6.62H1.29a12 12 0 0 0 0 10.76l3.98-3.09Z"
    />
    <path
      fill="#EB4335"
      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0A12 12 0 0 0 1.29 6.62l3.98 3.09C6.22 6.86 8.87 4.75 12 4.75Z"
    />
  </svg>
)

/**
 * The sign-up password rule, mirrored from the server.
 *
 * `apps/api/src/lib/auth.ts` sets no `minPasswordLength`, so Better Auth falls
 * back to its own default of 8 (verified in `better-auth@1.7.5`
 * `dist/create-context.mjs`: `options.emailAndPassword?.minPasswordLength || 8`).
 * Checking it here turns a rejected request into inline feedback.
 */
const MIN_PASSWORD_LENGTH = 8

const passwordLength: Validator = minLength(
  MIN_PASSWORD_LENGTH,
  `Use at least ${MIN_PASSWORD_LENGTH} characters.`,
)

/** Matches the confirmation field against the one above it. */
const matchesPassword: Validator = (value, values) =>
  value === values?.password ? undefined : 'Passwords do not match'

/**
 * Labelled password field.
 *
 * `TextInput` would do, but it renders the label on its own line with nowhere
 * to put an autofill hint, so this composes the same primitives `text-input.tsx`
 * does. Keeping `FormLabel` + `FormControl` preserves their `htmlFor`/`id`
 * pairing, which is what puts the error message and the input in the same
 * `aria-describedby` chain.
 */
function PasswordInput({
  source,
  label,
  autoComplete,
  hint,
}: {
  source: string
  label: string
  autoComplete: string
  hint?: string
}) {
  const { id, field, isRequired } = useInput({
    source,
    label,
    // `required()` has to come first: without it the password fields would show
    // no asterisk, and an empty confirm field would satisfy `matchesPassword`
    // (undefined === undefined) and let the request reach the server.
    validate: [
      required(),
      source === 'password' ? passwordLength : matchesPassword,
    ],
  })

  return (
    <FormField id={id} name={field.name}>
      <FormLabel>
        <FieldTitle label={label} source={source} isRequired={isRequired} />
      </FormLabel>
      <FormControl>
        <Input {...field} type="password" autoComplete={autoComplete} />
      </FormControl>
      {hint ? <FieldDescription>{hint}</FieldDescription> : null}
      <FormError />
    </FormField>
  )
}

export function SignupPage(props: { redirectTo?: string }) {
  const { redirectTo } = props
  const [loading, setLoading] = useState(false)
  const [socialLoading, setSocialLoading] = useState(false)
  const notify = useNotify()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { resetNotifications } = useNotificationContext()

  const handleSubmit: SubmitHandler<FieldValues> = async (values) => {
    setLoading(true)

    // Better Auth's client resolves `{ data, error }` for API failures, but a
    // transport failure still rejects, so both branches are handled.
    const { error } = await authClient.signUp
      .email({
        name: values.name,
        email: values.email,
        password: values.password,
      })
      .catch(() => ({ error: { message: 'Could not reach the server' } }))

    if (error) {
      setLoading(false)
      notify(error.message || 'Could not create your account', {
        type: 'error',
      })
      return
    }

    /*
     * Better Auth's `autoSignIn` defaults to true, so the signup response has
     * already set the session cookie and the user is genuinely authenticated.
     *
     * react-admin does not know that yet. Its gate is the react-query entry
     * `['auth', 'checkAuth', {}]`, and nothing in ra-core invalidates it after a
     * successful auth — `useLogin` only invalidates `['auth', 'getPermissions']`
     * (`dist/auth/useLogin.js`), while `useLogout` dodges the whole problem with
     * `queryClient.clear()`. `useGetIdentity` and `usePermissions` each hold their
     * result for 5 minutes as well, so an anonymous reading of either could
     * otherwise outlive the signup.
     *
     * Invalidating the `['auth']` prefix drops all three before navigating.
     */
    resetNotifications()
    queryClient.invalidateQueries({ queryKey: ['auth'] })
    navigate(redirectTo || '/', { replace: true })
  }

  const handleGoogleSignIn = async () => {
    setSocialLoading(true)
    const { error } = await authClient.signIn.social({
      provider: 'google',
      callbackURL: '/',
    })
    // On success Better Auth navigates to Google, so there is nothing to reset.
    if (error) {
      setSocialLoading(false)
      notify(error.message || 'Google sign-up is not available right now', {
        type: 'error',
      })
    }
  }

  return (
    <AuthShell>
      <div className="mx-auto flex w-full max-w-sm flex-col justify-center">
        <div className="mb-6 space-y-2 text-center">
          <h1 className="text-3xl font-semibold tracking-tight">
            Create your account
          </h1>
          <p className="text-sm text-muted-foreground">
            Sign up to start managing your books.
          </p>
        </div>

        <Form className="flex flex-col gap-6" onSubmit={handleSubmit}>
          <div className="space-y-7">
            <TextInput
              label="Full name"
              source="name"
              autoComplete="name"
              autoFocus
              validate={required()}
            />
            <TextInput
              label="Email"
              source="email"
              type="email"
              autoComplete="email"
              validate={required()}
            />
            <PasswordInput
              label="Password"
              source="password"
              autoComplete="new-password"
              hint={`Must be at least ${MIN_PASSWORD_LENGTH} characters.`}
            />
            <PasswordInput
              label="Confirm password"
              source="confirmPassword"
              autoComplete="new-password"
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={loading || socialLoading}
          >
            Sign up
          </Button>

          <FieldSeparator className="my-0">Or Continue With</FieldSeparator>

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleGoogleSignIn}
            disabled={loading || socialLoading}
          >
            <GoogleMark className="size-4" />
            Sign up with Google
          </Button>

          <FieldDescription className="text-center">
            Already have an account?{' '}
            <LinkBase to="/login" className="underline underline-offset-4">
              Sign in
            </LinkBase>
          </FieldDescription>
        </Form>
      </div>
    </AuthShell>
  )
}
