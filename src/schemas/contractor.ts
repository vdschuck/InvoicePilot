import { z } from 'zod'
import type { Contractor } from '../types'

const requiredField = (label: string) =>
  z.string().trim().min(1, `${label} is required`)

export const contractorSchema = z.object({
  name: z.string().trim().optional(),
  companyName: requiredField('Company name'),
  streetAddress: requiredField('Street address'),
  city: requiredField('City'),
  state: requiredField('State'),
  country: requiredField('Country'),
  zipCode: requiredField('Zip code'),
  contactNumber: requiredField('Contact number'),
  paymentInformation: z.string().trim().optional(),
}) satisfies z.ZodType<Contractor>

export type ContractorFormValues = z.infer<typeof contractorSchema>
