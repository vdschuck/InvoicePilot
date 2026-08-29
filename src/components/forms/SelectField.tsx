import type { UseFormRegisterReturn } from 'react-hook-form'

interface SelectFieldProps {
  label: string
  registration: UseFormRegisterReturn
  error?: string
  options: { value: string; label: string }[]
  placeholder?: string
}

export function SelectField({
  label,
  registration,
  error,
  options,
  placeholder,
}: SelectFieldProps) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="font-medium text-gray-700">{label}</span>
      <select
        className="rounded-md border border-gray-300 px-3 py-2 text-base"
        {...registration}
      >
        <option value="" disabled>
          {placeholder ?? `Select ${label.toLowerCase()}`}
        </option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <span role="alert" className="text-sm text-red-600">
          {error}
        </span>
      )}
    </label>
  )
}
