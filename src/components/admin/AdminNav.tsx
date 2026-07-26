'use client'

import {
  adminNavTree,
  isNavBranch,
  normalizeAdminPath,
  type NavBranch,
  type NavLeaf,
  type NavNode,
} from '@/admin/nav-tree'
import { NavIcon } from '@/components/admin/nav-icons'
import { NavHamburger, NavWrapper } from '@payloadcms/next/client'
import { Link, Logout } from '@payloadcms/ui'
import { usePathname, useSearchParams } from 'next/navigation'
import React, { useCallback, useMemo, useSyncExternalStore } from 'react'

const baseClass = 'nav'
const OPEN_STORAGE_KEY = 'bw-admin-nav-open'

function pathMatches(pathname: string, href: string): boolean {
  const path = normalizeAdminPath(pathname)
  const target = normalizeAdminPath(href)

  if (target === '/admin') {
    return path === '/admin' || path === '/admin/'
  }
  if (path === target) return true
  if (target.includes('coming-soon') || target.endsWith('/create')) {
    return false
  }
  // Collection list: also active on document edit, not on /create
  if (path.startsWith(`${target}/`)) {
    const rest = path.slice(target.length + 1)
    if (rest === 'create' || rest.startsWith('create/')) return false
    return true
  }
  return false
}

function leafIsActive(
  leaf: NavLeaf,
  pathname: string,
  sectionParam: string | null,
): boolean {
  if (leaf.stub) {
    return pathname.startsWith('/admin/coming-soon') && sectionParam === leaf.id
  }
  return pathMatches(pathname, leaf.href)
}

function branchContainsActive(
  branch: NavBranch,
  pathname: string,
  sectionParam: string | null,
): boolean {
  return branch.children.some((child) => {
    if (isNavBranch(child)) {
      return branchContainsActive(child, pathname, sectionParam)
    }
    return leafIsActive(child, pathname, sectionParam)
  })
}

/**
 * Which branches are expanded lives in localStorage, i.e. outside React. It is read
 * through a store rather than mirrored into state by an effect: the lint config
 * enforces the React Compiler rules and rejects a synchronous `setState` in an effect
 * body, and `useSyncExternalStore` is the sanctioned way to read external mutable
 * state without a hydration mismatch (the server snapshot is simply "nothing open").
 *
 * Snapshots are the raw JSON string so repeated reads stay referentially equal.
 */
const EMPTY_SNAPSHOT = '{}'
const openListeners = new Set<() => void>()

function subscribeOpen(listener: () => void) {
  openListeners.add(listener)
  return () => {
    openListeners.delete(listener)
  }
}

function openSnapshot(): string {
  try {
    return window.localStorage.getItem(OPEN_STORAGE_KEY) ?? EMPTY_SNAPSHOT
  } catch {
    return EMPTY_SNAPSHOT
  }
}

function openServerSnapshot(): string {
  return EMPTY_SNAPSHOT
}

function writeStoredOpen(map: Record<string, boolean>) {
  try {
    window.localStorage.setItem(OPEN_STORAGE_KEY, JSON.stringify(map))
  } catch {
    // A blocked localStorage only means the tree forgets its state between visits.
  }
  for (const listener of openListeners) listener()
}

function parseStoredOpen(raw: string): Record<string, boolean> {
  try {
    const parsed = JSON.parse(raw) as unknown
    if (parsed && typeof parsed === 'object') {
      return parsed as Record<string, boolean>
    }
  } catch {
    // ignore
  }
  return {}
}

function NavLeafLink({
  leaf,
  active,
  pathname,
}: {
  leaf: NavLeaf
  active: boolean
  pathname: string
}) {
  const label = (
    <>
      {active ? <div className={`${baseClass}__link-indicator`} /> : null}
      {leaf.icon ? (
        <span className="bw-nav__icon">
          <NavIcon name={leaf.icon} />
        </span>
      ) : null}
      <span className={`${baseClass}__link-label`}>{leaf.label}</span>
      {leaf.stub ? (
        <span className="bw-nav__stub-mark" title="W przygotowaniu">
          ·
        </span>
      ) : null}
    </>
  )

  if (active && normalizeAdminPath(pathname) === normalizeAdminPath(leaf.href)) {
    return (
      <div className={`${baseClass}__link bw-nav__link`} id={`nav-${leaf.id}`}>
        {label}
      </div>
    )
  }

  return (
    <Link
      className={`${baseClass}__link bw-nav__link${active ? ' bw-nav__link--active' : ''}`}
      href={leaf.href}
      id={`nav-${leaf.id}`}
      prefetch={false}
    >
      {label}
    </Link>
  )
}

function NavTreeNode({
  node,
  depth,
  openMap,
  toggle,
  pathname,
  sectionParam,
}: {
  node: NavNode
  depth: number
  openMap: Record<string, boolean>
  toggle: (id: string) => void
  pathname: string
  sectionParam: string | null
}) {
  if (!isNavBranch(node)) {
    const active = leafIsActive(node, pathname, sectionParam)
    return (
      <div
        className="bw-nav__leaf"
        style={depth > 1 ? { paddingLeft: `${(depth - 1) * 0.65}rem` } : undefined}
      >
        <NavLeafLink leaf={node} active={active} pathname={pathname} />
      </div>
    )
  }

  const hasActive = branchContainsActive(node, pathname, sectionParam)
  const isOpen = openMap[node.id] ?? (depth === 0 || hasActive)

  return (
    <div
      className={`bw-nav__branch${isOpen ? ' bw-nav__branch--open' : ''}`}
      style={depth > 0 ? { paddingLeft: `${depth * 0.35}rem` } : undefined}
    >
      <button
        type="button"
        className={`bw-nav__branch-toggle${depth === 0 ? ' bw-nav__branch-toggle--root' : ''}`}
        aria-expanded={isOpen}
        onClick={() => toggle(node.id)}
      >
        <span className="bw-nav__chevron" aria-hidden>
          {isOpen ? '▾' : '▸'}
        </span>
        {node.icon ? (
          <span className="bw-nav__icon">
            <NavIcon name={node.icon} />
          </span>
        ) : null}
        <span className="bw-nav__branch-label">{node.label}</span>
      </button>
      {isOpen ? (
        <div className="bw-nav__children" role="group" aria-label={node.label}>
          {node.children.map((child) => (
            <NavTreeNode
              key={child.id}
              node={child}
              depth={depth + 1}
              openMap={openMap}
              toggle={toggle}
              pathname={pathname}
              sectionParam={sectionParam}
            />
          ))}
        </div>
      ) : null}
    </div>
  )
}

/**
 * Replaces Payload DefaultNav with the BodyWork nested sidebar tree.
 */
export function AdminNav() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const sectionParam = searchParams.get('section')

  const storedRaw = useSyncExternalStore(subscribeOpen, openSnapshot, openServerSnapshot)
  const openMap = useMemo(() => parseStoredOpen(storedRaw), [storedRaw])

  // A branch holding the active route renders open regardless of what's stored — see
  // the `?? (depth === 0 || hasActive)` fallback in `NavBranchView`. Nothing needs to be
  // written for that, so there is no effect here mirroring it into storage.
  const toggle = useCallback(
    (id: string) => {
      writeStoredOpen({ ...openMap, [id]: !(openMap[id] ?? false) })
    },
    [openMap],
  )

  return (
    <NavWrapper baseClass={baseClass}>
      <nav className={`${baseClass}__wrap bw-nav`}>
        <div className="bw-nav__tree">
          {adminNavTree.map((branch) => (
            <NavTreeNode
              key={branch.id}
              node={branch}
              depth={0}
              openMap={openMap}
              toggle={toggle}
              pathname={pathname}
              sectionParam={sectionParam}
            />
          ))}
        </div>
        <div className={`${baseClass}__controls`}>
          <Logout />
        </div>
      </nav>
      <div className={`${baseClass}__header`}>
        <div className={`${baseClass}__header-content`}>
          <NavHamburger baseClass={baseClass} />
        </div>
      </div>
    </NavWrapper>
  )
}
