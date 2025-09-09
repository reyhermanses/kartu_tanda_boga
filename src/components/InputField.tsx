type Props = {
  label: string
  type?: string
  placeholder?: string
  value: string
  onChange: (value: string) => void
  error?: string
  required?: boolean
}

export function InputField({ label, type = 'text', placeholder, value, onChange, error, required }: Props) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm text-neutral-700 font-medium">
        {label} {required && <span className="text-rose-600">*</span>}
      </span>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        aria-invalid={!!error}
        aria-describedby={error ? `${label}-error` : undefined}
        className={`w-full rounded-lg border bg-white px-3 py-2 text-sm outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 ${
          error ? 'border-rose-500' : 'border-neutral-300'
        }`}
      />
      {error && (
        <span id={`${label}-error`} className="mt-1 block text-xs text-rose-600">
          {error}
        </span>
      )}
    </label>
  )
}


