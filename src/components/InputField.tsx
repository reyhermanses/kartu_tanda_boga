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
  // Safari iPhone date input support
  const isDateInput = type === 'date'
  const dateInputProps = isDateInput ? {
    min: '1900-01-01',
    max: new Date().toISOString().split('T')[0], // Today's date
    pattern: '[0-9]{4}-[0-9]{2}-[0-9]{2}',
    inputMode: 'numeric' as const,
    autoComplete: 'bday' as const,
  } : {}

  return (
    <label className="block">
      <span className="mb-1 sm:mb-2 block text-xs sm:text-sm text-white font-medium">
        {label} {required && <span className="text-red-300">*</span>}
      </span>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        aria-invalid={!!error}
        aria-describedby={error ? `${label}-error` : undefined}
        className={`w-full rounded-[15px] sm:rounded-[20px] border-2 bg-transparent px-2 py-2 sm:px-3 sm:py-3 md:px-4 md:py-5 text-white placeholder-white/70 outline-none focus:border-white focus:ring-1 focus:ring-white/50 focus:bg-transparent hover:bg-transparent transition-all text-sm sm:text-base ${
          error ? 'border-orange-500' : 'border-red-400'
        }`}
        style={isDateInput ? { 
          colorScheme: 'dark',
          color: 'white',
          paddingBottom: '15px',
          marginBottom: '5px'
        } : {
          paddingBottom: '15px',
          marginBottom: '5px'
        }}
        {...dateInputProps}
      />
      {error && (
        <span id={`${label}-error`} className="mt-1 block text-xs text-white">
          {error}
        </span>
      )}
    </label>
  )
}


