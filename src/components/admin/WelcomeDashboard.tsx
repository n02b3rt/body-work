'use client'

import type { User } from '@/payload-types'
import { useAuth } from '@payloadcms/ui'
import Link from 'next/link'
import React from 'react'

const roleLabel: Record<string, string> = {
  administrator: 'Administrator',
  moderator: 'Moderator',
  redaktor: 'Redaktor',
  klient: 'Klient',
}

export function WelcomeDashboard() {
  const { user } = useAuth()
  const typed = user as User | null | undefined
  const role = typed?.role
  const displayName = typed?.name || typed?.email || 'użytkowniku'
  const canManageUsers = role === 'administrator' || role === 'moderator'

  return (
    <div className="bw-welcome">
      <h1 className="bw-welcome__title">Witaj w panelu BodyWork</h1>
      <p className="bw-welcome__lead">
        Cześć, <strong>{displayName}</strong>
        {role ? (
          <>
            {' '}
            · rola: <strong>{roleLabel[role] ?? role}</strong>
          </>
        ) : null}
        . Ten panel zastępuje WordPress wp-admin — treści i media edytujesz tutaj.
      </p>

      <div className="bw-welcome__cards">
        <Link className="bw-welcome__card" href="/admin/collections/media">
          <span className="bw-welcome__card-label">Media</span>
          <span className="bw-welcome__card-hint">Dodawaj i zarządzaj zdjęciami oraz plikami</span>
        </Link>

        {canManageUsers ? (
          <Link className="bw-welcome__card" href="/admin/collections/users">
            <span className="bw-welcome__card-label">Użytkownicy</span>
            <span className="bw-welcome__card-hint">Konta zespołu i klientów</span>
          </Link>
        ) : null}

        <Link className="bw-welcome__card" href="/admin/account">
          <span className="bw-welcome__card-label">Twoje konto</span>
          <span className="bw-welcome__card-hint">Hasło, język i dane profilu</span>
        </Link>
      </div>
    </div>
  )
}
