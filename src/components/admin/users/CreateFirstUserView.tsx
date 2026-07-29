import type { AdminViewServerProps } from 'payload'

import { CreateFirstUserForm } from '@/components/admin/users/CreateFirstUserForm'
import React from 'react'

/**
 * Replaces Payload's stock create-first-user form with first/last name,
 * auto username, live uniqueness checks, password show/generate, and
 * password confirmation (required for the first dashboard user).
 */
export function CreateFirstUserView(_props: AdminViewServerProps) {
  return (
    <div className="create-first-user">
      <h1>Witaj w panelu BodyWork</h1>
      <p>Utwórz pierwsze konto administratora, aby zacząć pracę.</p>
      <CreateFirstUserForm />
    </div>
  )
}
