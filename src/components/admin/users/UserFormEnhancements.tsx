'use client'

import { generateStrongPassword, suggestUsername } from '@/lib/users'
import { useDocumentInfo, useFormFields } from '@payloadcms/ui'
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

type Availability = {
  emailTaken: boolean
  usernameTaken: boolean
  suggestions: string[]
}

function IconEye({ off = false }: { off?: boolean }) {
  if (off) {
    return (
      <svg width="18" height="18" viewBox="0 0 16 16" fill="none" aria-hidden>
        <path
          d="M2 8s2.5-4.5 6-4.5S14 8 14 8s-2.5 4.5-6 4.5S2 8 2 8Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <circle cx="8" cy="8" r="1.75" stroke="currentColor" strokeWidth="1.5" />
        <path d="M3 13.5 13 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    )
  }
  return (
    <svg width="18" height="18" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M2 8s2.5-4.5 6-4.5S14 8 14 8s-2.5 4.5-6 4.5S2 8 2 8Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <circle cx="8" cy="8" r="1.75" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}

function IconKey() {
  return (
    <svg width="18" height="18" viewBox="0 0 16 16" fill="none" aria-hidden>
      <circle cx="5.5" cy="5.5" r="2.75" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M7.5 7.5 13.5 13.5M11 11l1.5 1.5M12.5 9.5 14 11"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/**
 * UI field on the Users document form.
 * Layout order + plain auth styling live in custom.css.
 * This component: auto username, availability, password icon actions, create-mode confirm sync.
 */
export function UserFormEnhancements() {
  const { id } = useDocumentInfo()
  const isCreate = !id

  const [firstName, lastName, email, username, password] = useFormFields(
    ([fields]) =>
      [
        fields.firstName?.value as string | undefined,
        fields.lastName?.value as string | undefined,
        fields.email?.value as string | undefined,
        fields.username?.value as string | undefined,
        fields.password?.value as string | undefined,
      ] as const,
  )
  const dispatchFields = useFormFields(([, dispatch]) => dispatch)

  const usernameManualRef = useRef(false)
  const lastAutoUsername = useRef('')
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showPassword, setShowPassword] = useState(false)
  const [passwordHost, setPasswordHost] = useState<HTMLElement | null>(null)
  const [usernameHost, setUsernameHost] = useState<HTMLElement | null>(null)
  const availabilityTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Mark the users document shell for CSS layout / create tweaks.
  useEffect(() => {
    document.documentElement.classList.add('bw-users-form')
    if (isCreate) document.documentElement.classList.add('bw-users-create')
    return () => {
      document.documentElement.classList.remove('bw-users-form', 'bw-users-create')
    }
  }, [isCreate])

  // Locate hosts for portals (password actions + username suggestions).
  useLayoutEffect(() => {
    const setPasswordLabel = (field: Element | null) => {
      if (!isCreate || !field) return
      const labelRoot =
        field.querySelector('.field-label') || field.querySelector('label')
      if (!labelRoot) return
      // Payload puts the caption in a text node or plain label content.
      const walker = document.createTreeWalker(labelRoot, NodeFilter.SHOW_TEXT)
      let node = walker.nextNode()
      while (node) {
        if (node.textContent && node.textContent.trim()) {
          node.textContent = 'Hasło'
          break
        }
        node = walker.nextNode()
      }
    }

    const findHosts = () => {
      const passwordInput = document.getElementById(
        'field-password',
      ) as HTMLInputElement | null
      if (passwordInput?.parentElement) {
        passwordInput.parentElement.classList.add('bw-password-field-wrap')
        setPasswordHost(passwordInput.parentElement)
        setPasswordLabel(passwordInput.closest('.field-type'))
      } else {
        setPasswordHost(null)
      }

      const usernameInput = document.getElementById(
        'field-username',
      ) as HTMLInputElement | null
      const usernameField = usernameInput?.closest('.field-type') as HTMLElement | null
      setUsernameHost(usernameField)
    }

    findHosts()
    // Auth may mount password fields after "change password" on edit.
    const root = document.querySelector('.collection-edit--users')
    if (!root) return
    const observer = new MutationObserver(findHosts)
    observer.observe(root, { childList: true, subtree: true })
    return () => observer.disconnect()
  }, [isCreate, password])

  // Track manual username edits.
  useEffect(() => {
    const current = (username ?? '').toString()
    if (
      current &&
      lastAutoUsername.current &&
      current !== lastAutoUsername.current
    ) {
      usernameManualRef.current = true
    }
  }, [username])

  // Auto-fill username from first/last/email when not manually edited.
  useEffect(() => {
    if (usernameManualRef.current) return
    const next = suggestUsername({
      firstName: firstName ?? '',
      lastName: lastName ?? '',
      email: email ?? '',
    })
    if (!next || next === (username ?? '')) return
    lastAutoUsername.current = next
    dispatchFields({
      type: 'UPDATE',
      path: 'username',
      value: next,
    })
  }, [firstName, lastName, email, username, dispatchFields])

  // On create: mirror password → confirm-password (single password field UX).
  useEffect(() => {
    if (!isCreate) return
    dispatchFields({
      type: 'UPDATE',
      path: 'confirm-password',
      value: password ?? '',
      valid: true,
    })
  }, [isCreate, password, dispatchFields])

  // Live availability checks.
  useEffect(() => {
    if (availabilityTimer.current) clearTimeout(availabilityTimer.current)
    availabilityTimer.current = setTimeout(async () => {
      const qs = new URLSearchParams()
      if (email) qs.set('email', String(email))
      if (username) qs.set('username', String(username))
      if (id != null) qs.set('excludeId', String(id))
      if (![...qs.keys()].some((k) => k === 'email' || k === 'username')) {
        setSuggestions([])
        return
      }
      try {
        const res = await fetch(
          `/api/admin/users/availability?${qs.toString()}`,
          { credentials: 'include' },
        )
        if (!res.ok) return
        const data = (await res.json()) as Availability
        setSuggestions(data.usernameTaken ? (data.suggestions ?? []) : [])

        if (email) {
          dispatchFields({
            type: 'UPDATE',
            path: 'email',
            valid: !data.emailTaken,
            errorMessage: data.emailTaken
              ? 'Ten adres e-mail jest już zajęty.'
              : undefined,
          })
        }
        if (username) {
          dispatchFields({
            type: 'UPDATE',
            path: 'username',
            valid: !data.usernameTaken,
            errorMessage: data.usernameTaken
              ? 'Ta nazwa użytkownika jest zajęta.'
              : undefined,
          })
        }
      } catch {
        // ignore network blips
      }
    }, 400)
    return () => {
      if (availabilityTimer.current) clearTimeout(availabilityTimer.current)
    }
  }, [email, username, id, dispatchFields])

  // Toggle stock password input type.
  useEffect(() => {
    const passwordInput = document.getElementById(
      'field-password',
    ) as HTMLInputElement | null
    const confirmInput = document.getElementById(
      'field-confirm-password',
    ) as HTMLInputElement | null
    const type = showPassword ? 'text' : 'password'
    if (passwordInput) passwordInput.type = type
    if (confirmInput && !isCreate) confirmInput.type = type
  }, [showPassword, isCreate, password, passwordHost])

  const onGenerate = () => {
    const generated = generateStrongPassword(20)
    dispatchFields({ type: 'UPDATE', path: 'password', value: generated })
    dispatchFields({
      type: 'UPDATE',
      path: 'confirm-password',
      value: generated,
      valid: true,
    })
    setShowPassword(true)
  }

  const pickSuggestion = (value: string) => {
    usernameManualRef.current = true
    dispatchFields({ type: 'UPDATE', path: 'username', value })
  }

  const passwordActions =
    passwordHost &&
    createPortal(
      <div className="bw-password-actions">
        <button
          type="button"
          className="bw-password-action"
          title={showPassword ? 'Ukryj hasło' : 'Pokaż hasło'}
          aria-label={showPassword ? 'Ukryj hasło' : 'Pokaż hasło'}
          onClick={() => setShowPassword((v) => !v)}
        >
          <IconEye off={showPassword} />
        </button>
        <button
          type="button"
          className="bw-password-action"
          title="Generuj silne hasło"
          aria-label="Generuj silne hasło"
          onClick={onGenerate}
        >
          <IconKey />
        </button>
      </div>,
      passwordHost,
    )

  const usernameSuggestions =
    usernameHost &&
    suggestions.length > 0 &&
    createPortal(
      <div className="bw-username-suggestions">
        <span className="bw-username-suggestions__label">Propozycje:</span>
        {suggestions.map((s) => (
          <button
            key={s}
            type="button"
            className="bw-username-suggestions__chip"
            onClick={() => pickSuggestion(s)}
          >
            {s}
          </button>
        ))}
      </div>,
      usernameHost,
    )

  // Invisible mount point — layout/behavior only (portals render into auth fields).
  return (
    <div className="bw-user-form-enhancements" aria-hidden>
      {passwordActions}
      {usernameSuggestions}
    </div>
  )
}
