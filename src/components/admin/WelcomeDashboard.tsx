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
  const canManageSettings = role === 'administrator'

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
        .
      </p>

      <div className="bw-welcome__cards">
        <Link className="bw-welcome__card" href="/admin/c/pages">
          <span className="bw-welcome__card-label">Strony</span>
          <span className="bw-welcome__card-hint">Struktura i treści podstron</span>
        </Link>

        <Link className="bw-welcome__card" href="/admin/c/posts">
          <span className="bw-welcome__card-label">Wpisy</span>
          <span className="bw-welcome__card-hint">Blog i aktualności</span>
        </Link>

        <Link className="bw-welcome__card" href="/admin/c/media">
          <span className="bw-welcome__card-label">Media</span>
          <span className="bw-welcome__card-hint">Zdjęcia i pliki (WebP / WebM)</span>
        </Link>

        {canManageUsers ? (
          <Link className="bw-welcome__card" href="/admin/c/users">
            <span className="bw-welcome__card-label">Użytkownicy</span>
            <span className="bw-welcome__card-hint">Konta zespołu i klientów</span>
          </Link>
        ) : null}

        {canManageSettings ? (
          <Link className="bw-welcome__card" href="/admin/g/site-settings">
            <span className="bw-welcome__card-label">Ustawienia witryny</span>
            <span className="bw-welcome__card-hint">Tożsamość, kontakt, SEO</span>
          </Link>
        ) : null}

        {canManageSettings ? (
          <Link className="bw-welcome__card" href="/admin/updates">
            <span className="bw-welcome__card-label">Aktualizacje</span>
            <span className="bw-welcome__card-hint">Wersje bibliotek vs npm</span>
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
