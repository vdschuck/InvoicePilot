import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { TextareaField } from '../forms/TextareaField'
import { TextField } from '../forms/TextField'
import { contractorSchema, type ContractorFormValues } from '../../schemas/contractor'
import { saveContractor } from '../../services/storage'
import type { Contractor } from '../../types'

const emptyContractor: ContractorFormValues = {
  name: '',
  companyName: '',
  streetAddress: '',
  city: '',
  state: '',
  country: '',
  zipCode: '',
  contactNumber: '',
  paymentInformation: '',
}

const PAYMENT_INFORMATION_PLACEHOLDER = `Beneficiary name:
SWIFT/BIC:
Bank Account Number:
Bank Name:
Bank Address:`

export function ContractorForm({ contractor }: { contractor: Contractor | null }) {
  const navigate = useNavigate()
  const [saveError, setSaveError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ContractorFormValues>({
    resolver: zodResolver(contractorSchema),
    defaultValues: contractor ?? emptyContractor,
  })

  function onSubmit(values: ContractorFormValues) {
    try {
      saveContractor(values)
      navigate('/clients')
    } catch {
      setSaveError('Failed to save contractor information. Please try again.')
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      onChange={() => setSaveError(null)}
      className="flex w-full max-w-[30.8rem] flex-col gap-4"
      noValidate
    >
      <TextField label="Contractor name" registration={register('name')} error={errors.name?.message} />
      <TextField
        label="Company name"
        registration={register('companyName')}
        error={errors.companyName?.message}
      />
      <TextField
        label="Street address"
        registration={register('streetAddress')}
        error={errors.streetAddress?.message}
      />
      <TextField label="City" registration={register('city')} error={errors.city?.message} />
      <TextField label="State" registration={register('state')} error={errors.state?.message} />
      <TextField label="Country" registration={register('country')} error={errors.country?.message} />
      <TextField label="Zip code" registration={register('zipCode')} error={errors.zipCode?.message} />
      <TextField
        label="Contact number"
        type="tel"
        registration={register('contactNumber')}
        error={errors.contactNumber?.message}
      />
      <TextareaField
        label="Payment information"
        registration={register('paymentInformation')}
        error={errors.paymentInformation?.message}
        placeholder={PAYMENT_INFORMATION_PLACEHOLDER}
      />

      <button
        type="submit"
        className="cursor-pointer rounded-md bg-gray-900 px-4 py-2 font-medium text-white hover:bg-gray-700"
      >
        Save
      </button>

      {saveError && (
        <p role="alert" className="text-sm text-red-600">
          {saveError}
        </p>
      )}
    </form>
  )
}
