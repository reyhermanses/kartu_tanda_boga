import { InputField } from './InputField'
import { PhotoUploader } from './PhotoUploader'
import type { FormErrors, FormValues } from '../types'

type Props = {
  values: FormValues
  errors: FormErrors
  onChange: (next: Partial<FormValues>) => void
}

export function FormSection({ values, errors, onChange }: Props) {
  return (
    <section className="space-y-4">
      <InputField
        label="Name"
        placeholder=""
        required
        value={values.name}
        onChange={(v) => onChange({ name: v })}
        error={errors.name}
      />
      <InputField
        label="Phone Number"
        type="tel"
        required
        value={values.phone}
        onChange={(v) => onChange({ phone: v })}
        error={errors.phone}
      />
      <InputField
        label="Email"
        type="email"
        required
        value={values.email}
        onChange={(v) => onChange({ email: v })}
        error={errors.email}
      />
      <InputField
        label="Birthday"
        type="date"
        required
        value={values.birthday}
        onChange={(v) => onChange({ birthday: v })}
        error={errors.birthday}
      />
      <PhotoUploader
        required
        error={errors.photoFile}
        onChange={(file) => onChange({ photoFile: file })}
      />
      <p className="mt-4 text-sm font-semibold">Choose Card :</p>
    </section>
  )
}


