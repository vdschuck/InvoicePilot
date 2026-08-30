import type { FieldErrors, UseFormRegister } from 'react-hook-form'
import type { InvoiceFormValues, InvoiceItemFormValues } from '../../schemas/invoice'
import { TextField } from '../forms/TextField'

interface InvoiceItemRowProps {
  index: number
  register: UseFormRegister<InvoiceFormValues>
  errors?: FieldErrors<InvoiceItemFormValues>
  onRemove: () => void
  canRemove: boolean
}

export function InvoiceItemRow({
  index,
  register,
  errors,
  onRemove,
  canRemove,
}: InvoiceItemRowProps) {
  return (
    <div className="flex flex-col gap-3 rounded-md border border-gray-200 p-4">
      <input type="hidden" {...register(`items.${index}.id` as const)} />

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="sm:w-1/3">
          <TextField
            label="Ref No"
            registration={register(`items.${index}.refNo` as const)}
            error={errors?.refNo?.message}
          />
        </div>
        <div className="sm:w-2/3">
          <TextField
            label="Description"
            registration={register(`items.${index}.description` as const)}
            error={errors?.description?.message}
          />
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="sm:w-1/2">
          <TextField
            label="Quantity"
            type="number"
            registration={register(`items.${index}.quantity` as const, { valueAsNumber: true })}
            error={errors?.quantity?.message}
          />
        </div>
        <div className="sm:w-1/2">
          <TextField
            label="Rate"
            type="number"
            registration={register(`items.${index}.rate` as const, { valueAsNumber: true })}
            error={errors?.rate?.message}
          />
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={onRemove}
          disabled={!canRemove}
          className="cursor-pointer text-sm font-medium text-red-600 underline disabled:cursor-not-allowed disabled:text-gray-400"
        >
          Remove
        </button>
      </div>
    </div>
  )
}
