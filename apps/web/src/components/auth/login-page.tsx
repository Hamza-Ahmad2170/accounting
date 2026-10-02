import { useState } from 'react'
import {
  FieldTitle,
  Form,
  LinkBase,
  required,
  useInput,
  useLogin,
  useNotify,
} from 'ra-core'
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
import { Notification } from '@/components/admin/notification'
import { authClient } from '@/lib/auth-client'

/** Google's brand mark. Not in lucide, which ships no third-party logos. */
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
 * Password field with a recovery link on the label row.
 *
 * `TextInput` renders the label on its own line with nowhere to put the link,
 * so this mirrors `text-input.tsx` and composes the same primitives. Keeping
 * `FormLabel` + `FormControl` preserves the `htmlFor`/`id` pairing they set up.
 */
const PasswordField = () => {
  const { id, field, isRequired } = useInput({
    source: 'password',
    label: 'Password',
    validate: required(),
  })

  return (
    <FormField id={id} name={field.name}>
      <div className="flex items-baseline justify-between gap-4">
        <FormLabel>
          <FieldTitle
            label="Password"
            source="password"
            isRequired={isRequired}
          />
        </FormLabel>
        <LinkBase
          to="/forgot-password"
          className="text-sm leading-none text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
        >
          Forgot password?
        </LinkBase>
      </div>
      <FormControl>
        <Input {...field} type="password" autoComplete="current-password" />
      </FormControl>
      <FormError />
    </FormField>
  )
}

export function LoginPage(props: { redirectTo?: string }) {
  const { redirectTo } = props
  const [loading, setLoading] = useState(false)
  const [socialLoading, setSocialLoading] = useState(false)
  const login = useLogin()
  const notify = useNotify()

  const handleSubmit: SubmitHandler<FieldValues> = (values) => {
    setLoading(true)
    login(values, redirectTo)
      .then(() => {
        setLoading(false)
      })
      .catch((error) => {
        setLoading(false)
        notify(
          typeof error === 'string'
            ? error
            : typeof error === 'undefined' || !error.message
              ? 'ra.auth.sign_in_error'
              : error.message,
          {
            type: 'error',
            messageArgs: {
              _:
                typeof error === 'string'
                  ? error
                  : error && error.message
                    ? error.message
                    : undefined,
            },
          },
        )
      })
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
      notify(error.message || 'Google sign-in is not available right now', {
        type: 'error',
      })
    }
  }

  return (
    <div className="flex min-h-screen">
      <div className="container relative grid grid-cols-1 flex-col items-center justify-center sm:max-w-none lg:grid-cols-2 lg:px-0">
        <div className="relative hidden h-full flex-col overflow-hidden bg-muted p-10 text-white dark:border-r lg:flex">
          <img
            src="/login-panel-bg.jpg"
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-cover"
          />
          {/* Tames the brightest highlights (measured L=0.77) so white text keeps
              >=4.5:1. The image's mean luminance is 0.037, so this stays light
              enough to see the picture. */}
          <div className="absolute inset-0 bg-zinc-950/55" />
          <div className="relative z-20 flex items-center text-lg font-medium">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mr-2 h-6 w-6"
            >
              <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
            </svg>
            Acme Inc
          </div>
          <div className="relative z-20 mt-auto">
            <blockquote className="space-y-2">
              <p className="text-lg">
                &ldquo;Shadcn Admin Kit has allowed us to quickly create and
                evolve a powerful tool that otherwise would have taken months of
                time and effort to develop.&rdquo;
              </p>
              <footer className="text-sm">John Doe</footer>
            </blockquote>
          </div>
        </div>

        <div className="w-full lg:p-8">
          <div className="mx-auto flex w-full max-w-sm flex-col justify-center">
            <div className="mb-6 space-y-2 text-center">
              <h1 className="text-3xl font-semibold tracking-tight">
                Welcome back
              </h1>
              <p className="text-sm text-muted-foreground">
                Sign in to your workspace.
              </p>
            </div>

            <Form className="flex flex-col gap-6" onSubmit={handleSubmit}>
              <div className="space-y-7">
                <TextInput
                  label="Email"
                  source="email"
                  type="email"
                  autoComplete="email"
                  autoFocus
                  validate={required()}
                />
                <PasswordField />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={loading || socialLoading}
              >
                Login
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
                Login with Google
              </Button>

              <FieldDescription className="text-center">
                Don&apos;t have an account?{' '}
                <LinkBase
                  to="/register"
                  className="underline underline-offset-4"
                >
                  Sign up
                </LinkBase>
              </FieldDescription>
            </Form>
          </div>
        </div>
      </div>
      <Notification />
    </div>
  )
}
