import { useState } from 'react'
import { ClientForm } from '../components/clients/ClientForm'
import type { ClientFormValues } from '../schemas/client'
import { addClient, deleteClient, getAppData, MAX_CLIENTS, updateClient } from '../services/storage'
import type { Client } from '../types'

type FormState = { mode: 'closed' } | { mode: 'add' } | { mode: 'edit'; client: Client }

export function ClientsPage() {
  const [clients, setClients] = useState<Client[]>(() => getAppData()?.clients ?? [])
  const [formState, setFormState] = useState<FormState>({ mode: 'closed' })
  const [error, setError] = useState<string | null>(null)

  function handleAdd(values: ClientFormValues) {
    try {
      setClients(addClient(values))
      setFormState({ mode: 'closed' })
      setError(null)
    } catch {
      setError('Failed to add the client. Please try again.')
    }
  }

  function handleEdit(id: string, values: ClientFormValues) {
    try {
      setClients(updateClient(id, values))
      setFormState({ mode: 'closed' })
      setError(null)
    } catch {
      setError('Failed to update the client. Please try again.')
    }
  }

  function handleDelete(client: Client) {
    if (!window.confirm(`Delete ${client.name}?`)) return
    try {
      setClients(deleteClient(client.id))
      setError(null)
    } catch {
      setError('Failed to delete the client. Please try again.')
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Clients</h1>
        <span className="text-sm text-gray-600">
          {clients.length} / {MAX_CLIENTS}
        </span>
      </div>

      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}

      {clients.length === 0 ? (
        <p className="text-gray-600">No clients registered yet.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {clients.map((client) => (
            <li
              key={client.id}
              className="flex flex-col gap-3 rounded-md border border-gray-200 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-medium">{client.name}</p>
                <p className="text-sm text-gray-600">
                  {client.companyName} · {client.currency}
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setFormState({ mode: 'edit', client })}
                  className="text-sm font-medium text-gray-900 underline"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(client)}
                  className="text-sm font-medium text-red-600 underline"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {formState.mode === 'closed' && (
        <button
          type="button"
          disabled={clients.length >= MAX_CLIENTS}
          onClick={() => setFormState({ mode: 'add' })}
          className="w-fit rounded-md bg-gray-900 px-4 py-2 font-medium text-white hover:bg-gray-700 disabled:cursor-not-allowed disabled:bg-gray-300"
        >
          Add Client
        </button>
      )}

      {formState.mode === 'add' && (
        <ClientForm
          submitLabel="Add Client"
          onSubmit={handleAdd}
          onCancel={() => setFormState({ mode: 'closed' })}
        />
      )}

      {formState.mode === 'edit' && (
        <ClientForm
          submitLabel="Save Changes"
          initialValues={formState.client}
          onSubmit={(values) => handleEdit(formState.client.id, values)}
          onCancel={() => setFormState({ mode: 'closed' })}
        />
      )}
    </div>
  )
}
