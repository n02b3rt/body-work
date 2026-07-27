'use client'

import type { Page } from '@/payload-types'
import { useConfig } from '@payloadcms/ui'
import Link from 'next/link'
import React, { useEffect, useMemo, useState } from 'react'

type TreeNode = Page & { children: TreeNode[] }

function buildTree(pages: Page[]): TreeNode[] {
  const map = new Map<number | string, TreeNode>()
  const roots: TreeNode[] = []

  for (const page of pages) {
    map.set(page.id, { ...page, children: [] })
  }

  for (const page of pages) {
    const node = map.get(page.id)
    if (!node) continue
    const parentId =
      typeof page.parent === 'object' && page.parent !== null
        ? page.parent.id
        : page.parent

    if (parentId != null && map.has(parentId)) {
      map.get(parentId)!.children.push(node)
    } else {
      roots.push(node)
    }
  }

  const sortNodes = (nodes: TreeNode[]) => {
    nodes.sort((a, b) => a.title.localeCompare(b.title, 'pl'))
    nodes.forEach((n) => sortNodes(n.children))
  }
  sortNodes(roots)
  return roots
}

function TreeItem({
  node,
  depth,
  adminRoute,
}: {
  node: TreeNode
  depth: number
  adminRoute: string
}) {
  const [open, setOpen] = useState(depth < 1)
  const hasChildren = node.children.length > 0
  const href = `${adminRoute}/c/pages/${node.id}`

  return (
    <li className="bw-pages-tree__item">
      <div className="bw-pages-tree__row" style={{ paddingLeft: `${depth * 1.1}rem` }}>
        {hasChildren ? (
          <button
            type="button"
            className="bw-pages-tree__toggle"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? '▾' : '▸'}
          </button>
        ) : (
          <span className="bw-pages-tree__toggle bw-pages-tree__toggle--spacer" />
        )}
        <Link className="bw-pages-tree__link" href={href}>
          {node.title}
        </Link>
        <span className="bw-pages-tree__meta">
          /{node.slug}
          {node._status === 'draft' ? ' · szkic' : ''}
        </span>
      </div>
      {hasChildren && open ? (
        <ul className="bw-pages-tree__list">
          {node.children.map((child) => (
            <TreeItem key={child.id} node={child} depth={depth + 1} adminRoute={adminRoute} />
          ))}
        </ul>
      ) : null}
    </li>
  )
}

export function PagesTree() {
  const { config } = useConfig()
  const adminRoute = config.routes?.admin || '/admin'
  const [pages, setPages] = useState<Page[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const [reloadToken, setReloadToken] = useState(0)
  const apiRoute = config.routes?.api || '/api'

  useEffect(() => {
    let cancelled = false

    // Every state update sits behind an `await`, so none of them run synchronously in
    // the effect body, which is what the React Compiler lint rule rejects. The
    // cancelled flag also stops a late response from writing into an unmounted tree.
    void (async () => {
      try {
        const res = await fetch(`${apiRoute}/pages?limit=200&depth=0&sort=title`, {
          credentials: 'include',
        })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const json = (await res.json()) as { docs: Page[] }
        if (cancelled) return
        setPages(json.docs || [])
        setError(null)
      } catch (err) {
        if (cancelled) return
        setError(err instanceof Error ? err.message : 'Nie udało się wczytać stron')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [apiRoute, reloadToken])

  const reload = () => {
    setLoading(true)
    setReloadToken((token) => token + 1)
  }

  const tree = useMemo(() => buildTree(pages), [pages])

  return (
    <div className="bw-pages-tree">
      <div className="bw-pages-tree__header">
        <strong>Drzewo stron</strong>
        <button type="button" className="bw-pages-tree__refresh" onClick={reload}>
          Odśwież
        </button>
      </div>
      {loading ? <p className="bw-pages-tree__status">Ładowanie…</p> : null}
      {error ? <p className="bw-pages-tree__status bw-pages-tree__status--error">{error}</p> : null}
      {!loading && !error && tree.length === 0 ? (
        <p className="bw-pages-tree__status">Brak stron: dodaj pierwszą poniżej.</p>
      ) : null}
      {!loading && tree.length > 0 ? (
        <ul className="bw-pages-tree__list bw-pages-tree__list--root">
          {tree.map((node) => (
            <TreeItem key={node.id} node={node} depth={0} adminRoute={adminRoute} />
          ))}
        </ul>
      ) : null}
    </div>
  )
}
