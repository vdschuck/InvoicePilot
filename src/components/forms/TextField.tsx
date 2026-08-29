import type { UseFormRegisterReturn } from 'react-hook-form'

interface TextFieldProps {
  label: string
  registration: UseFormRegisterReturn
  error?: string
  type?: string
}

export function TextField({ label, registration, error, type = 'text' }: TextFieldProps) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="font-medium text-gray-700">{label}</span>
      <input
        type={type}
        className="rounded-md border border-gray-300 px-3 py-2 text-base"
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
