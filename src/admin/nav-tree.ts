/**
 * Admin sidebar tree — single source of truth for Payload custom Nav.
 * Leaves with `href` pointing at `/admin/coming-soon` are stubs until features exist.
 *
 * Collection/global URLs use short prefixes `/admin/c/` and `/admin/g/`
 * (rewritten to Payload’s `/collections/` and `/globals/` in `src/proxy.ts`).
 */

import type { NavIconName } from '@/components/admin/nav-icons'

export type NavLeaf = {
  id: string
  label: string
  href: string
  icon?: NavIconName
  /** True when the target is a placeholder view, not a real collection/global. */
  stub?: boolean
}

export type NavBranch = {
  id: string
  label: string
  icon?: NavIconName
  children: NavNode[]
}

export type NavNode = NavBranch | NavLeaf

export function isNavBranch(node: NavNode): node is NavBranch {
  return 'children' in node
}

/** Short collection path used in the custom nav (rewritten → /collections/). */
export function collectionHref(slug: string, suffix = ''): string {
  return `/admin/c/${slug}${suffix}`
}

/** Short global path used in the custom nav (rewritten → /globals/). */
export function globalHref(slug: string): string {
  return `/admin/g/${slug}`
}

export function stubHref(sectionId: string): string {
  return `/admin/coming-soon?section=${encodeURIComponent(sectionId)}`
}

/** Normalize long Payload paths so active-state matching works either way. */
export function normalizeAdminPath(pathname: string): string {
  return pathname
    .replace(/^\/admin\/collections(\/|$)/, '/admin/c$1')
    .replace(/^\/admin\/globals(\/|$)/, '/admin/g$1')
}

function stub(id: string, label: string, icon?: NavIconName): NavLeaf {
  return { id, label, href: stubHref(id), stub: true, icon }
}

function link(
  id: string,
  label: string,
  href: string,
  icon?: NavIconName,
): NavLeaf {
  return { id, label, href, icon }
}

/** Full BodyWork admin navigation (Polish labels). */
export const adminNavTree: NavBranch[] = [
  {
    id: 'kokpit',
    label: 'Kokpit',
    icon: 'dashboard',
    children: [
      link('kokpit-summary', 'Podsumowanie', '/admin', 'dashboard'),
      stub('kokpit-updates', 'Aktualizacje', 'updates'),
    ],
  },
  {
    id: 'content',
    label: 'Treści',
    icon: 'content',
    children: [
      {
        id: 'content-pages',
        label: 'Strony',
        icon: 'pages',
        children: [
          link(
            'content-pages-new',
            'Nowa strona',
            collectionHref('pages', '/create'),
            'plus',
          ),
          link(
            'content-pages-all',
            'Wszystkie strony',
            collectionHref('pages'),
            'list',
          ),
        ],
      },
      {
        id: 'content-blog',
        label: 'Blog',
        icon: 'blog',
        children: [
          link(
            'content-blog-new',
            'Nowy wpis',
            collectionHref('posts', '/create'),
            'plus',
          ),
          link(
            'content-blog-all',
            'Wszystkie wpisy',
            collectionHref('posts'),
            'list',
          ),
          link(
            'content-blog-categories',
            'Kategorie',
            collectionHref('categories'),
            'folder',
          ),
          link(
            'content-blog-authors',
            'Autorzy',
            collectionHref('authors'),
            'users',
          ),
        ],
      },
      {
        id: 'content-media',
        label: 'Media',
        icon: 'media',
        children: [
          link(
            'content-media-upload',
            'Prześlij plik',
            collectionHref('media', '/create'),
            'plus',
          ),
          link(
            'content-media-all',
            'Biblioteka',
            collectionHref('media'),
            'list',
          ),
        ],
      },
    ],
  },
  {
    id: 'ecommerce',
    label: 'E-commerce',
    icon: 'cart',
    children: [
      stub('ecommerce-summary', 'Podsumowanie', 'dashboard'),
      stub('ecommerce-orders', 'Zamówienia', 'orders'),
      stub('ecommerce-customers', 'Klienci', 'users'),
      {
        id: 'ecommerce-products',
        label: 'Produkty',
        icon: 'product',
        children: [
          stub('ecommerce-products-new', 'Nowy produkt', 'plus'),
          stub('ecommerce-products-all', 'Wszystkie produkty', 'list'),
          stub('ecommerce-products-categories', 'Kategorie', 'folder'),
          stub('ecommerce-products-tags', 'Tagi', 'tag'),
        ],
      },
      stub('ecommerce-coupons', 'Kupony', 'coupon'),
      stub('ecommerce-reports', 'Raporty', 'chart'),
      stub('ecommerce-invoices', 'Faktury', 'invoice'),
      {
        id: 'ecommerce-settings',
        label: 'Ustawienia',
        icon: 'settings',
        children: [
          stub('ecommerce-settings-general', 'Ogólne', 'settings'),
          stub('ecommerce-settings-store', 'Sklep', 'store'),
          stub('ecommerce-settings-payments', 'Płatności', 'payment'),
          stub('ecommerce-settings-taxes', 'Podatki', 'tax'),
          stub('ecommerce-settings-messages', 'Wiadomości', 'message'),
        ],
      },
    ],
  },
  {
    id: 'management',
    label: 'Zarządzanie',
    icon: 'settings',
    children: [
      stub('management-translations', 'Tłumaczenia', 'translate'),
      {
        id: 'management-users',
        label: 'Użytkownicy',
        icon: 'users',
        children: [
          link(
            'management-users-new',
            'Nowy użytkownik',
            collectionHref('users', '/create'),
            'plus',
          ),
          link(
            'management-users-all',
            'Wszyscy użytkownicy',
            collectionHref('users'),
            'list',
          ),
        ],
      },
      {
        id: 'management-appearance',
        label: 'Wygląd',
        icon: 'appearance',
        children: [
          link(
            'management-appearance-colors',
            'Schemat kolorów',
            globalHref('theme-colors'),
            'colors',
          ),
          {
            id: 'management-appearance-components',
            label: 'Komponenty',
            icon: 'component',
            children: [
              link(
                'management-appearance-components-new',
                'Nowy komponent',
                collectionHref('site-components', '/create'),
                'plus',
              ),
              link(
                'management-appearance-components-all',
                'Wszystkie komponenty',
                collectionHref('site-components'),
                'list',
              ),
            ],
          },
        ],
      },
      stub('management-libraries', 'Biblioteki', 'library'),
      stub('management-seo', 'SEO', 'seo'),
      stub('management-backups', 'Kopie zapasowe', 'backup'),
      {
        id: 'management-settings',
        label: 'Ustawienia',
        icon: 'settings',
        children: [
          link(
            'management-settings-site',
            'Witryna',
            globalHref('site-settings'),
            'site',
          ),
          {
            id: 'management-settings-content',
            label: 'Treści',
            icon: 'content',
            children: [
              stub('management-settings-content-pages', 'Strony', 'pages'),
              stub('management-settings-content-blog', 'Blog', 'blog'),
              stub('management-settings-content-media', 'Media', 'media'),
            ],
          },
          stub('management-settings-analytics', 'Analityka', 'analytics'),
          stub('management-settings-cookies', 'Ciasteczka', 'cookie'),
          stub('management-settings-admin', 'Administracja', 'admin'),
        ],
      },
    ],
  },
]

/** Flat map of section id → breadcrumb labels for Coming Soon view. */
export function findNavPathLabels(sectionId: string): string[] | null {
  const walk = (nodes: NavNode[], trail: string[]): string[] | null => {
    for (const node of nodes) {
      const next = [...trail, node.label]
      if (node.id === sectionId) return next
      if (isNavBranch(node)) {
        const found = walk(node.children, next)
        if (found) return found
      }
    }
    return null
  }
  return walk(adminNavTree, [])
}

export function findNavLabel(sectionId: string): string | null {
  const path = findNavPathLabels(sectionId)
  return path ? path[path.length - 1]! : null
}
