import { Notification } from '@/components/admin/notification'

/**
 * Split-screen shell shared by the auth pages: branded panel on the left, the
 * page's own form on the right.
 *
 * Only the form differs between sign-in and sign-up, so both pages render it as
 * a child. `children` sits in the right column and owns its own width — this
 * column is `w-full` at every breakpoint, which is what keeps the form at
 * `max-w-sm` instead of collapsing to its content size (a content-sized grid
 * track would resolve `w-full` against the text, not the viewport).
 */
export function AuthShell({ children }: { children: React.ReactNode }) {
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

        <div className="w-full lg:p-8">{children}</div>
      </div>
      <Notification />
    </div>
  )
}
