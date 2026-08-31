import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { CURRENCIES } from '../../constants/currencies'
import { clientSchema, type ClientFormValues } from '../../schemas/client'
import { SelectField } from '../forms/SelectField'
import { TextareaField } from '../forms/TextareaField'
import { TextField } from '../forms/TextField'

const emptyClient: ClientFormValues = {
  companyName: '',
  streetAddress: '',
  city: '',
  state: '',
  country: '',
  contactNumber: '',
  currency: '',
  bankingDetails: '',
}

const BANKING_DETAILS_PLACEHOLDER = `TIN (CUI/CIF):
Account No:
Routing No:
Bank:`

const currencyOptions = CURRENCIES.map((currency) => ({
  value: currency.code,
  label: `${currency.code} - ${currency.name}`,
}))

interface ClientFormProps {
  initialValues?: ClientFormValues
  onSubmit: (values: ClientFormValues) => void
  onCancel?: () => void
  submitLabel: string
  disabled?: boolean
}

export function ClientForm({
  initialValues,
  onSubmit,
  onCancel,
  submitLabel,
  disabled = false,
}: ClientFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ClientFormValues>({
    resolver: zodResolver(clientSchema),
    defaultValues: initialValues ?? emptyClient,
  })

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex max-w-md flex-col gap-4"
      noValidate
    >
      <TextField
        label="Company name"
        registration={register('companyName')}
        error={errors.companyName?.message}
        required
      />
      <TextField
        label="Street address"
        registration={register('streetAddress')}
        error={errors.streetAddress?.message}
        required
      />
      <TextField label="City" registration={register('city')} error={errors.city?.message} required />
      <TextField label="State" registration={register('state')} error={errors.state?.message} required />
      <TextField
        label="Country"
        registration={register('country')}
        error={errors.country?.message}
        required
      />
      <TextField
        label="Contact number"
        type="tel"
        registration={register('contactNumber')}
        error={errors.contactNumber?.message}
        required
      />
      <SelectField
        label="Currency"
        registration={register('currency')}
        error={errors.currency?.message}
        options={currencyOptions}
        required
      />
      <TextareaField
        label="Banking details"
        registration={register('bankingDetails')}
        error={errors.bankingDetails?.message}
        placeholder={BANKING_DETAILS_PLACEHOLDER}
      />

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={disabled}
          className="cursor-pointer rounded-md bg-gray-900 px-4 py-2 font-medium text-white hover:bg-gray-700 disabled:cursor-not-allowed disabled:bg-gray-300"
        >
          {submitLabel}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="cursor-pointer rounded-md border border-gray-300 px-4 py-2 font-medium hover:bg-gray-50"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  )
}
