'use client'

import type {
  PackageKind,
  PackageUpdateRow,
} from '@/lib/package-updates-shared'
import { releaseNotesUrl } from '@/lib/package-updates-shared'
import React from 'react'

export const kindLabel: Record<PackageKind, string> = {
  runtime: 'Runtime',
  dev: 'Dev',
}

function IconSvg({ children }: { children: React.ReactNode }) {
  return (
    <svg
      className="bw-updates__icon"
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      {children}
    </svg>
  )
}

function NpmIcon() {
  return (
    <IconSvg>
      {/* Simplified npm mark: box with "n" bar */}
      <path
        d="M2 2.5h12v11H2v-11Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M5.5 5.5v5.5h1.75V7.25H8.5V11h1.75V5.5H5.5Z"
        fill="currentColor"
      />
    </IconSvg>
  )
}

function HomepageIcon() {
  return (
    <IconSvg>
      <circle
        cx="8"
        cy="8"
        r="5.5"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M2.5 8h11M8 2.5c1.6 1.8 2.4 3.6 2.4 5.5S9.6 11.7 8 13.5M8 2.5C6.4 4.3 5.6 6.1 5.6 8s.8 3.7 2.4 5.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </IconSvg>
  )
}

function GithubIcon() {
  return (
    <IconSvg>
      <path
        fill="currentColor"
        d="M8 1.5A6.5 6.5 0 0 0 6.05 14.2c.33.06.45-.14.45-.32v-1.13c-1.83.4-2.22-.88-2.22-.88-.3-.76-.73-.96-.73-.96-.6-.41.05-.4.05-.4.66.05 1 .68 1 .68.59 1 1.54.71 1.91.54.06-.42.23-.71.42-.87-1.46-.17-3-.73-3-3.25 0-.72.26-1.3.68-1.76-.07-.17-.3-.85.06-1.77 0 0 .55-.18 1.8.66a6.2 6.2 0 0 1 3.28 0c1.25-.84 1.8-.66 1.8-.66.36.92.13 1.6.06 1.77.42.46.68 1.04.68 1.76 0 2.53-1.54 3.08-3.01 3.24.24.21.45.61.45 1.24v1.84c0 .18.12.39.46.32A6.5 6.5 0 0 0 8 1.5Z"
      />
    </IconSvg>
  )
}

function RepoIcon() {
  return (
    <IconSvg>
      <path
        d="M5 2.5h6.5L13 4v9.5H5V2.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M7 6h3.5M7 8.5h3.5M7 11h2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </IconSvg>
  )
}

function ReleaseNotesIcon() {
  return (
    <IconSvg>
      <path
        d="M4 2.5h6.5L13 5v8.5H4V2.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M10.5 2.5V5H13M6 7.5h4M6 10h4M6 12.5h2.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </IconSvg>
  )
}

function IconLink({
  href,
  label,
  children,
}: {
  href: string
  label: string
  children: React.ReactNode
}) {
  return (
    <a
      className="bw-updates__icon-link"
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      title={label}
      aria-label={label}
    >
      {children}
    </a>
  )
}

function VersionCell({ value }: { value: string | null }) {
  if (!value) {
    return <span className="bw-updates__muted">niedostępna</span>
  }
  return <code>{value}</code>
}

/** Libraries view: npm + homepage + repository icon links only. */
function PackageLinksCell({ row }: { row: PackageUpdateRow }) {
  return (
    <span className="bw-updates__links">
      <IconLink href={row.links.npm} label={`npm: ${row.name}`}>
        <NpmIcon />
      </IconLink>
      {row.links.homepage ? (
        <IconLink href={row.links.homepage} label={`Strona: ${row.name}`}>
          <HomepageIcon />
        </IconLink>
      ) : null}
      {row.links.repository ? (
        <IconLink
          href={row.links.repository}
          label={
            /github\.com/i.test(row.links.repository)
              ? `GitHub: ${row.name}`
              : `Repozytorium: ${row.name}`
          }
        >
          {/github\.com/i.test(row.links.repository) ? (
            <GithubIcon />
          ) : (
            <RepoIcon />
          )}
        </IconLink>
      ) : null}
    </span>
  )
}

/** Updates view: single link to GitHub release notes (or Google fallback). */
function ReleaseNotesCell({ row }: { row: PackageUpdateRow }) {
  if (!row.latest) {
    return <span className="bw-updates__muted">—</span>
  }
  const href = releaseNotesUrl(row.name, row.latest, row.links.repository)
  const isGithub =
    Boolean(row.links.repository) && /github\.com/i.test(row.links.repository!)
  const label = isGithub
    ? `Opis wersji ${row.latest} na GitHubie`
    : `Szukaj: ${row.name} ${row.latest}`

  return (
    <span className="bw-updates__links">
      <IconLink href={href} label={label}>
        <ReleaseNotesIcon />
      </IconLink>
      <a
        className="bw-updates__ext-link bw-updates__release-link"
        href={href}
        target="_blank"
        rel="noopener noreferrer"
      >
        {isGithub ? 'GitHub' : 'Google'}
      </a>
    </span>
  )
}

export function PackageTable({
  title,
  rows,
  mode,
}: {
  title: string
  rows: PackageUpdateRow[]
  /** updates = outdated only (versions + release notes); libraries = inventory + icons */
  mode: 'updates' | 'libraries'
}) {
  if (rows.length === 0) return null

  if (mode === 'updates') {
    return (
      <section className="bw-updates__section">
        <h2 className="bw-updates__section-title">{title}</h2>
        <div className="bw-updates__table-wrap">
          <table className="bw-updates__table bw-updates__table--updates">
            <colgroup>
              <col className="bw-updates__col-name" />
              <col className="bw-updates__col-ver" />
              <col className="bw-updates__col-ver" />
              <col className="bw-updates__col-ver" />
              <col className="bw-updates__col-release" />
            </colgroup>
            <thead>
              <tr>
                <th scope="col">Pakiet</th>
                <th scope="col">Zadeklarowana</th>
                <th scope="col">Zainstalowana</th>
                <th scope="col">Najnowsza</th>
                <th scope="col">Opis wersji</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.name}>
                  <td>
                    <div className="bw-updates__name">
                      <code>{row.name}</code>
                    </div>
                  </td>
                  <td className="bw-updates__version">
                    <code>{row.declared}</code>
                  </td>
                  <td className="bw-updates__version">
                    <VersionCell value={row.installed} />
                  </td>
                  <td className="bw-updates__version">
                    <VersionCell value={row.latest} />
                  </td>
                  <td className="bw-updates__links-cell">
                    <ReleaseNotesCell row={row} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    )
  }

  // libraries — inventory only: name, installed version, icon links
  return (
    <section className="bw-updates__section">
      <h2 className="bw-updates__section-title">{title}</h2>
      <div className="bw-updates__table-wrap">
        <table className="bw-updates__table bw-updates__table--libraries">
          <colgroup>
            <col className="bw-updates__col-name" />
            <col className="bw-updates__col-version" />
            <col className="bw-updates__col-links" />
          </colgroup>
          <thead>
            <tr>
              <th scope="col">Pakiet</th>
              <th scope="col">Wersja</th>
              <th scope="col" className="bw-updates__th-links">
                Linki
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.name}>
                <td>
                  <div className="bw-updates__name">
                    <code>{row.name}</code>
                  </div>
                </td>
                <td className="bw-updates__version">
                  <VersionCell value={row.installed} />
                </td>
                <td className="bw-updates__links-cell">
                  <PackageLinksCell row={row} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

/** Toolbar for Kokpit → Aktualizacje only (counts + last check + refresh). */
export function PackageCheckToolbar({
  packages,
  updates,
  unknown,
  checkedAtLabel,
  nextCheckLabel,
  checking,
  onCheck,
  extra,
}: {
  packages: number
  updates: number
  unknown: number
  checkedAtLabel: string
  nextCheckLabel: string
  checking: boolean
  onCheck: () => void
  extra?: React.ReactNode
}) {
  return (
    <div className="bw-updates__toolbar">
      <div className="bw-updates__summary">
        <span>
          <strong>{packages}</strong> pakietów
        </span>
        <span className="bw-updates__summary-sep" aria-hidden>
          ·
        </span>
        <span>
          <strong>{updates}</strong> z dostępną aktualizacją
        </span>
        {unknown > 0 ? (
          <>
            <span className="bw-updates__summary-sep" aria-hidden>
              ·
            </span>
            <span>
              <strong>{unknown}</strong> bez wyniku
            </span>
          </>
        ) : null}
        <span className="bw-updates__summary-sep" aria-hidden>
          ·
        </span>
        <span className="bw-updates__checked">
          sprawdzono: {checkedAtLabel}
        </span>
        <span className="bw-updates__summary-sep" aria-hidden>
          ·
        </span>
        <span className="bw-updates__checked">
          auto: co 24h (następne ~{nextCheckLabel})
        </span>
        {extra}
      </div>

      <button
        type="button"
        className="bw-updates__check-btn"
        onClick={onCheck}
        disabled={checking}
      >
        {checking ? 'Sprawdzanie…' : 'Sprawdź teraz'}
      </button>
    </div>
  )
}

export async function fetchPackageReport(force: boolean): Promise<{
  report?: import('@/lib/package-updates-shared').PackageUpdatesReport
  error?: string
}> {
  const res = await fetch('/api/admin/package-updates', {
    method: force ? 'POST' : 'GET',
    credentials: 'include',
  })
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { error?: string } | null
    return {
      error: body?.error || 'Nie udało się sprawdzić wersji pakietów.',
    }
  }
  const body = (await res.json()) as {
    report: import('@/lib/package-updates-shared').PackageUpdatesReport
  }
  return { report: body.report }
}
