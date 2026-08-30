import { z } from 'zod'
import { CURRENCY_CODES } from '../constants/currencies'
import type { Client } from '../types'

const requiredField = (label: string) =>
  z.string().trim().min(1, `${label} is required`)

export const clientSchema = z.object({
  name: requiredField('Client name'),
  companyName: requiredField('Company name'),
  streetAddress: requiredField('Street address'),
  city: requiredField('City'),
  state: requiredField('State'),
  country: requiredField('Country'),
  contactNumber: requiredField('Contact number'),
  currency: z.string().refine((value) => CURRENCY_CODES.includes(value), {
    message: 'Select a valid currency',
  }),
  bankingDetails: z.string().trim().optional(),
}) satisfies z.ZodType<Omit<Client, 'id'>>

export type ClientFormValues = z.infer<typeof clientSchema>
