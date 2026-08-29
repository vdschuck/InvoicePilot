import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
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
  contactNumber: '',
}

export function ContractorForm({ contractor }: { contractor: Contractor | null }) {
  const [saved, setSaved] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ContractorFormValues>({
    resolver: zodResolver(contractorSchema),
    defaultValues: contractor ?? emptyContractor,
  })

  function onSubmit(values: ContractorFormValues) {
    saveContractor(values)
    setSaved(true)
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      onChange={() => setSaved(false)}
      className="flex max-w-md flex-col gap-4"
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
      <TextField
        label="Contact number"
        type="tel"
        registration={register('contactNumber')}
        error={errors.contactNumber?.message}
      />

      <button
        type="submit"
        className="rounded-md bg-gray-900 px-4 py-2 font-medium text-white hover:bg-gray-700"
      >
        Save
      </button>

      {saved && (
        <p role="status" className="text-sm text-green-700">
          Contractor information saved.
        </p>
      )}
    </form>
  )
}
