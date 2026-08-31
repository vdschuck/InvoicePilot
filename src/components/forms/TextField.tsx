import type { UseFormRegisterReturn } from 'react-hook-form'

interface TextFieldProps {
  label: string
  registration: UseFormRegisterReturn
  error?: string
  type?: string
  required?: boolean
}

export function TextField({ label, registration, error, type = 'text', required = false }: TextFieldProps) {
  return (
    <label className="flex w-full flex-col gap-1 text-sm">
      <span className="font-medium text-gray-700">
        {label}
        {required && <span className="text-red-600"> *</span>}
      </span>
      <input
        type={type}
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
