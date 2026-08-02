'use client'

import {
  generateStrongPassword,
  suggestUsername,
} from '@/lib/users'
import { useAuth, useConfig } from '@payloadcms/ui'
import { formatAdminURL } from 'payload/shared'
import React, { useCallback, useEffect, useRef, useState } from 'react'

import styles from './password-tools.module.css'

type Availability = {
  emailTaken: boolean
  usernameTaken: boolean
  suggestions: string[]
}

async function fetchAvailability(params: {
  email?: string
  username?: string
}): Promise<Availability | null> {
  const qs = new URLSearchParams()
  if (params.email) qs.set('email', params.email)
  if (params.username) qs.set('username', params.username)
  if (![...qs.keys()].length) return null
  try {
    const res = await fetch(`/api/admin/users/availability?${qs.toString()}`, {
      credentials: 'include',
    })
    if (!res.ok) return null
    return (await res.json()) as Availability
  } catch {
    return null
  }
}

export function CreateFirstUserForm() {
  const { setUser } = useAuth()
  const {
    config: {
      routes: { admin, api: apiRoute },
      admin: { user: userSlug },
    },
  } = useConfig()

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [usernameManual, setUsernameManual] = useState(false)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [emailTaken, setEmailTaken] = useState(false)
  const [usernameTaken, setUsernameTaken] = useState(false)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const emailTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const usernameTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Auto username from name fields until the user edits username manually.
  useEffect(() => {
    if (usernameManual) return
    const next = suggestUsername({ firstName, lastName, email })
    setUsername(next)
  }, [firstName, lastName, email, usernameManual])

  const checkEmail = useCallback((value: string) => {
    if (emailTimer.current) clearTimeout(emailTimer.current)
    emailTimer.current = setTimeout(async () => {
      if (!value.includes('@')) {
        setEmailTaken(false)
        return
      }
      const result = await fetchAvailability({ email: value })
      setEmailTaken(Boolean(result?.emailTaken))
    }, 350)
  }, [])

  const checkUsername = useCallback((value: string, mail: string) => {
    if (usernameTimer.current) clearTimeout(usernameTimer.current)
    usernameTimer.current = setTimeout(async () => {
      if (value.length < 2) {
        setUsernameTaken(false)
        setSuggestions([])
        return
      }
      const result = await fetchAvailability({ username: value, email: mail })
      setUsernameTaken(Boolean(result?.usernameTaken))
      setSuggestions(result?.suggestions ?? [])
    }, 350)
  }, [])

  useEffect(() => {
    checkEmail(email)
  }, [email, checkEmail])

  useEffect(() => {
    checkUsername(username, email)
  }, [username, email, checkUsername])

  const onGeneratePassword = () => {
    const generated = generateStrongPassword(20)
    setPassword(generated)
    setConfirmPassword(generated)
    setShowPassword(true)
  }

  const passwordsMatch = password === confirmPassword
  const canSubmit =
    Boolean(email.trim()) &&
    Boolean(username.trim()) &&
    password.length >= 8 &&
    passwordsMatch &&
    !emailTaken &&
    !usernameTaken &&
    !submitting

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setFormError(null)
    if (!canSubmit) return
    if (!passwordsMatch) {
      setFormError('Hasła nie są takie same.')
      return
    }

    setSubmitting(true)
    try {
      const action = formatAdminURL({
        apiRoute,
        path: `/${userSlug}/first-register`,
      })
      const res = await fetch(action, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          username: username.trim().toLowerCase(),
          password,
          firstName: firstName.trim() || undefined,
          lastName: lastName.trim() || undefined,
        }),
      })

      const data = (await res.json().catch(() => null)) as {
        user?: unknown
        errors?: Array<{ message?: string }>
        message?: string
      } | null

      if (!res.ok) {
        const msg =
          data?.errors?.[0]?.message ||
          data?.message ||
          'Nie udało się utworzyć konta.'
        setFormError(msg)
        // Re-check uniqueness after failed submit.
        const result = await fetchAvailability({ email, username })
        setEmailTaken(Boolean(result?.emailTaken))
        setUsernameTaken(Boolean(result?.usernameTaken))
        setSuggestions(result?.suggestions ?? [])
        return
      }

      if (data?.user) {
        setUser(data as never)
      }
      window.location.href = admin
    } catch {
      setFormError('Błąd sieci. Spróbuj ponownie.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className={styles.createFirst} onSubmit={onSubmit} noValidate>
      {formError ? <div className={styles.formError}>{formError}</div> : null}

      <label>
        <span>
          Imię <span className={styles.optional}>(opcjonalne)</span>
        </span>
        <input
          autoComplete="given-name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
        />
      </label>

      <label>
        <span>
          Nazwisko <span className={styles.optional}>(opcjonalne)</span>
        </span>
        <input
          autoComplete="family-name"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
        />
      </label>

      <label>
        <span>E-mail</span>
        <input
          type="email"
          autoComplete="email"
          required
          value={email}
          className={emailTaken ? styles.hasError : undefined}
          onChange={(e) => setEmail(e.target.value)}
        />
        {emailTaken ? (
          <span className={styles.error}>Ten adres e-mail jest już zajęty.</span>
        ) : null}
      </label>

      <label>
        <span>Nazwa użytkownika</span>
        <input
          autoComplete="username"
          required
          value={username}
          className={usernameTaken ? styles.hasError : undefined}
          onChange={(e) => {
            setUsernameManual(true)
            setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ''))
          }}
        />
        {!usernameManual && (firstName || lastName) ? (
          <span className={styles.hint}>
            Uzupełniana automatycznie z imienia i nazwiska — możesz zmienić ręcznie.
          </span>
        ) : null}
        {usernameTaken ? (
          <>
            <span className={styles.error}>Ta nazwa użytkownika jest zajęta.</span>
            {suggestions.length > 0 ? (
              <div className={styles.suggestions}>
                {suggestions.map((s) => (
                  <button
                    key={s}
                    type="button"
                    className={styles.chip}
                    onClick={() => {
                      setUsernameManual(true)
                      setUsername(s)
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            ) : null}
          </>
        ) : null}
      </label>

      <div className={styles.passwordWrap}>
        <label>
          <span>Hasło</span>
          <input
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        <div className={styles.row}>
          <button
            type="button"
            className={styles.btn}
            onClick={() => setShowPassword((v) => !v)}
          >
            {showPassword ? 'Ukryj hasło' : 'Pokaż hasło'}
          </button>
          <button type="button" className={styles.btn} onClick={onGeneratePassword}>
            Generuj silne hasło
          </button>
        </div>
      </div>

      <label>
        <span>Potwierdź hasło</span>
        <input
          type={showPassword ? 'text' : 'password'}
          autoComplete="new-password"
          required
          value={confirmPassword}
          className={
            confirmPassword && !passwordsMatch ? styles.hasError : undefined
          }
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        {confirmPassword && !passwordsMatch ? (
          <span className={styles.error}>Hasła nie są takie same.</span>
        ) : null}
      </label>

      <button type="submit" className={styles.submit} disabled={!canSubmit}>
        {submitting ? 'Tworzenie…' : 'Utwórz konto'}
      </button>
    </form>
  )
}
