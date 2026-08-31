import { z } from 'zod'
import { CURRENCY_CODES } from '../constants/currencies'
import type { Client } from '../types'

const requiredField = (label: string) =>
  z.string().trim().min(1, `${label} is required`)

export const clientSchema = z.object({
  companyName: requiredField('Company name'),
  addressLine1: requiredField('Address line 1'),
  addressLine2: z.string().trim().optional(),
  city: requiredField('City'),
  state: requiredField('State'),
  country: requiredField('Country'),
  zipCode: requiredField('Zip code'),
  contactNumber: z.string().trim().optional(),
  currency: z.string().refine((value) => CURRENCY_CODES.includes(value), {
    message: 'Select a valid currency',
  }),
  bankingDetails: z.string().trim().optional(),
}) satisfies z.ZodType<Omit<Client, 'id'>>

export type ClientFormValues = z.infer<typeof clientSchema>
