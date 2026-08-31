import type { UseFormRegisterReturn } from 'react-hook-form'

interface TextareaFieldProps {
  label: string
  registration: UseFormRegisterReturn
  error?: string
  placeholder?: string
  rows?: number
  required?: boolean
}

export function TextareaField({
  label,
  registration,
  error,
  placeholder,
  rows = 4,
  required = false,
}: TextareaFieldProps) {
  return (
    <label className="flex w-full flex-col gap-1 text-sm">
      <span className="font-medium text-gray-700">
        {label}
        {required && <span className="text-red-600"> *</span>}
      </span>
      <textarea
        rows={rows}
        placeholder={placeholder}
        className="w-full rounded-md border border-gray-300 px-3 py-2 text-base"
        {...registration}
      />
      {error && (
        <span role="alert" className="text-sm text-red-600">
          {error}
        </span>
      )}
    </label>
  )
}
