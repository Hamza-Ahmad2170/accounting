import { useEffect, useState } from 'react'
import { FieldTitle, Form, regex, required, useInput, useNotify } from 'ra-core'
import type { SubmitHandler, FieldValues } from 'react-hook-form'
import { useFormContext } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import { FieldDescription } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
  FormControl,
  FormError,
  FormField,
  FormLabel,
} from '@/components/admin/form'
import { TextInput } from '@/components/admin/text-input'
import { AuthShell } from './auth-shell'
import { AuthFormLayout } from './form-layout'

/**
 * `Acme Corporation` -> `acme-corporation`.
 *
 * Better Auth stores whatever string arrives — `baseOrganizationSchema` in
 * `better-auth@1.7.5` is `slug: z.string().min(1)` with no normalisation
 * anywhere in the plugin, verified live: `"  spaced  "`, `"with/slash"` and a
 * lone `" "` are all accepted and stored verbatim. Deriving the slug here is the
 * only thing stopping `Acme Corp` and `acme-corp` from being two different
 * organisations.
 *
 * NFKD splits accents off their base letter so `Ünïcode` gives `unicode` rather
 * than dropping the leading character along with its marks.
 */
function slugify(value: string) {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * Slug field, composed from the same primitives as `text-input.tsx` so the label
 * row can carry a hint.
 *
 * `TextInput` would not work here: it spreads `{...rest}` *before* `{...field}`
 * onto the `<Input>`, so an `onChange` passed as a prop is silently overwritten
 * by RHF's own handler and the "user has overridden the derived value" signal
 * could never be raised.
 */
function SlugField({ onEdited }: { onEdited: () => void }) {
  const { id, field, isRequired } = useInput({
    source: 'slug',
    label: 'URL slug',
    // `required()` first: `regex` short-circuits to valid on empty input, so
    // without it a name that derives to nothing would submit.
    validate: [
      required(),
      regex(
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        'Use lowercase letters, numbers and single dashes.',
      ),
    ],
  })

  return (
    <FormField id={id} name={field.name}>
      <FormLabel>
        <FieldTitle label="URL slug" source="slug" isRequired={isRequired} />
      </FormLabel>
      <FormControl>
        <Input
          {...field}
          onChange={(event) => {
            onEdited()
            field.onChange(event)
          }}
          autoComplete="off"
          autoCapitalize="none"
          spellCheck={false}
        />
      </FormControl>
      <FieldDescription>
        Lowercase letters, numbers and dashes. This becomes your workspace
        address.
      </FieldDescription>
      <FormError />
    </FormField>
  )
}

function OrganizationFields() {
  const { watch, setValue } = useFormContext()
  const [slugEdited, setSlugEdited] = useState(false)
  const name = watch('name')

  // Once the user types in the slug we stop deriving, otherwise every keystroke
  // in the name field would throw away their correction.
  useEffect(() => {
    if (slugEdited) return
    setValue('slug', slugify(String(name ?? '')))
  }, [name, slugEdited, setValue])

  return (
    <>
      <TextInput
        label="Organization name"
        source="name"
        autoComplete="organization"
        autoFocus
        validate={required()}
      />
      <SlugField onEdited={() => setSlugEdited(true)} />
    </>
  )
}

export function CreateOrganizationPage() {
  const notify = useNotify()

  const handleSubmit: SubmitHandler<FieldValues> = () => {
    notify('Organization creation is not wired up yet.', { type: 'info' })
  }

  return (
    <AuthShell>
      <AuthFormLayout
        title="Create your organization"
        subtitle="This is the workspace your books and parties will live in."
      >
        <Form className="flex flex-col gap-6" onSubmit={handleSubmit}>
          <div className="space-y-7">
            <OrganizationFields />
          </div>

          <Button type="submit" className="w-full">
            Create organization
          </Button>
        </Form>
      </AuthFormLayout>
    </AuthShell>
  )
}
