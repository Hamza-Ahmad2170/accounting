/**
 * Heading + width wrapper shared by the auth pages.
 *
 * This is the part that was duplicated verbatim in `login-page.tsx` and
 * `signup-page.tsx`: the centred `max-w-sm` column and the title/subtitle
 * stack. Extracted so a third and fourth page cannot drift from the first two.
 *
 * The `<Form>` stays with the caller on purpose — pages differ in what sits
 * below the fields (a secondary button, a separator, a footer link), and that is
 * all just `children`.
 *
 * `w-full` on the wrapper is load-bearing. The shell's right column is also
 * `w-full`, but the grid track it lives in is content-sized unless told
 * otherwise, and `max-w-sm` would never engage against a 200px track.
 */
export function AuthFormLayout({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle?: string
  children: React.ReactNode
}) {
  return (
    <div className="mx-auto flex w-full max-w-sm flex-col justify-center">
      <div className="mb-6 space-y-2 text-center">
        <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
        {subtitle ? (
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        ) : null}
      </div>
      {children}
    </div>
  )
}
