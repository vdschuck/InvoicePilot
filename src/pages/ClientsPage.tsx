import { useState } from 'react'
import { ClientForm } from '../components/clients/ClientForm'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import type { ClientFormValues } from '../schemas/client'
import { addClient, deleteClient, getAppData, MAX_CLIENTS, updateClient } from '../services/storage'
import type { Client } from '../types'

type FormState = { mode: 'add' } | { mode: 'edit'; client: Client }

export function ClientsPage() {
  const [clients, setClients] = useState<Client[]>(() => getAppData()?.clients ?? [])
  const [formState, setFormState] = useState<FormState>({ mode: 'add' })
  const [formKey, setFormKey] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [clientPendingDeletion, setClientPendingDeletion] = useState<Client | null>(null)

  function resetForm() {
    setFormState({ mode: 'add' })
    setFormKey((key) => key + 1)
  }

  function handleAdd(values: ClientFormValues) {
    try {
      setClients(addClient(values))
      resetForm()
      setError(null)
    } catch {
      setError('Failed to add the client. Please try again.')
    }
  }

  function handleEdit(id: string, values: ClientFormValues) {
    try {
      setClients(updateClient(id, values))
      resetForm()
      setError(null)
    } catch {
      setError('Failed to update the client. Please try again.')
    }
  }

  function handleConfirmDelete() {
    if (!clientPendingDeletion) return
    try {
      setClients(deleteClient(clientPendingDeletion.id))
      if (formState.mode === 'edit' && formState.client.id === clientPendingDeletion.id) {
        resetForm()
      }
      setError(null)
    } catch {
      setError('Failed to delete the client. Please try again.')
    } finally {
      setClientPendingDeletion(null)
    }
  }

  const isMaxReached = clients.length >= MAX_CLIENTS

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="text-center">
        <h1 className="text-2xl font-semibold">Clients</h1>
        <p className="mt-2 text-gray-600">Please enter your client&apos;s information.</p>
      </div>

      {error && (
        <p role="alert" className="text-center text-sm text-red-600">
          {error}
        </p>
      )}

      <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-8 md:flex-row md:items-stretch">
        <div className="flex w-full flex-col gap-4 md:w-1/2">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Registered Clients</h2>
            <span className="text-sm text-gray-600">
              {clients.length} / {MAX_CLIENTS}
            </span>
          </div>

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
                      className="cursor-pointer text-sm font-medium text-gray-900 underline"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => setClientPendingDeletion(client)}
                      className="cursor-pointer text-sm font-medium text-red-600 underline"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="hidden w-px self-stretch bg-gray-200 md:block" />

        <div className="w-full md:w-1/2">
          <ClientForm
            key={formState.mode === 'edit' ? formState.client.id : `add-${formKey}`}
            submitLabel={formState.mode === 'edit' ? 'Save Changes' : 'Add Client'}
            initialValues={formState.mode === 'edit' ? formState.client : undefined}
            onSubmit={
              formState.mode === 'edit'
                ? (values) => handleEdit(formState.client.id, values)
                : handleAdd
            }
            onCancel={formState.mode === 'edit' ? resetForm : undefined}
            disabled={formState.mode === 'add' && isMaxReached}
          />
        </div>
      </div>

      <ConfirmDialog
        open={clientPendingDeletion !== null}
        title="Delete Client"
        message={`Delete ${clientPendingDeletion?.name}? This cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={handleConfirmDelete}
        onCancel={() => setClientPendingDeletion(null)}
      />
    </div>
  )
}
