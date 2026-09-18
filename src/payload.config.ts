import { postgresAdapter } from '@payloadcms/db-postgres'
import { nestedDocsPlugin } from '@payloadcms/plugin-nested-docs'
import { lexicalEditor, UploadFeature } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { en } from 'payload/i18n/en'
import { pl } from 'payload/i18n/pl'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Authors } from './collections/Authors'
import { Categories } from './collections/Categories'
import { Media } from './collections/Media'
import { Pages } from './collections/Pages'
import { PostTranslations } from './collections/PostTranslations'
import { Posts } from './collections/Posts'
import { SiteComponents } from './collections/SiteComponents'
import { Subscribers } from './collections/Subscribers'
import { Users } from './collections/Users'
import { SiteSettings } from './globals/SiteSettings'
import { ThemeColors } from './globals/ThemeColors'
import { PAYLOAD_DATETIME_FORMAT } from './lib/format-date'
import { IMAGE_DISPLAY_OPTIONS } from './lib/image-display'
import { resendEmailAdapter } from './lib/payload-email'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const dashboardURL =
  process.env.NEXT_PUBLIC_DASHBOARD_URL || 'http://dash.localhost:3000'
const publicURL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'
const dashboardHost = process.env.DASHBOARD_HOST || 'dash.localhost'
const centrumHost = process.env.CENTRUM_HOST || 'centrum.localhost'

/**
 * Additional trusted origins, comma separated, as full URLs.
 *
 * Production trusts exactly two: the public URL and the dashboard URL. A deployment
 * that answers on more than one public host, which the demo does (apex plus
 * `centrum.`), leaves the others out of `csrf`, and every POST from them fails with
 * "Nie mozesz wykonac tej akcji". Rather than widen the rule, name the extra hosts.
 */
function extraOrigins(): string[] {
  return (process.env.PAYLOAD_EXTRA_ORIGINS || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)
}

/**
 * Payload only accepts the auth cookie on POSTs whose `Origin` is in this list.
 * A GET to `/admin` can still look logged-in (no Origin → Sec-Fetch-Site fallback),
 * while save/form-state POSTs fail with Unauthorized / 403 if the port in the
 * browser does not match `.env`. Parallel agents often drift (`pnpm dev` → :3000
 * while `.env` says :3003), so in development we also allow the common slot ports.
 */
function csrfAndCorsOrigins(): string[] {
  const origins = new Set<string>([dashboardURL, publicURL])
  if (process.env.NODE_ENV !== 'production') {
    for (const port of [3000, 3001, 3002, 3003, 3004, 3005]) {
      origins.add(`http://${dashboardHost}:${port}`)
      origins.add(`http://${centrumHost}:${port}`)
      origins.add(`http://localhost:${port}`)
      origins.add(`http://127.0.0.1:${port}`)
    }
  }
  for (const origin of extraOrigins()) origins.add(origin)
  return [...origins]
}

const trustedOrigins = csrfAndCorsOrigins()

export default buildConfig({
  serverURL: dashboardURL,
  csrf: trustedOrigins,
  cors: trustedOrigins,
  admin: {
    user: Users.slug,
    dateFormat: PAYLOAD_DATETIME_FORMAT,
    // Extensions (Video Speed Controller, etc.) inject attrs on <html> before React
    // hydrates; without this the first load logs a recoverable mismatch. Same reason
    // the public locale layout sets suppressHydrationWarning on <body>.
    suppressHydrationWarning: true,
    timezones: {
      defaultTimezone: 'Europe/Warsaw',
      supportedTimezones: [{ label: 'Warszawa (CET/CEST)', value: 'Europe/Warsaw' }],
    },
    meta: {
      titleSuffix: ': BodyWork Panel',
    },
    importMap: {
      baseDir: path.resolve(dirname),
    },
    components: {
      Nav: '/components/admin/AdminNav#AdminNav',
      beforeDashboard: ['/components/admin/WelcomeDashboard#WelcomeDashboard'],
      providers: ['/components/admin/ai/AiHelpProvider#AiHelpProvider'],
      views: {
        createFirstUser: {
          Component: '/components/admin/users/CreateFirstUserView#CreateFirstUserView',
        },
        comingSoon: {
          Component: '/components/admin/ComingSoonView#ComingSoonView',
          path: '/coming-soon',
          meta: {
            title: 'W przygotowaniu',
          },
        },
        updates: {
          Component: '/components/admin/UpdatesView#UpdatesView',
          path: '/updates',
          meta: {
            title: 'Aktualizacje',
          },
        },
        libraries: {
          Component: '/components/admin/LibrariesView#LibrariesView',
          path: '/libraries',
          meta: {
            title: 'Biblioteki',
          },
        },
      },
    },
  },
  collections: [
    Users,
    Authors,
    Categories,
    Media,
    Pages,
    Posts,
    PostTranslations,
    Subscribers,
    SiteComponents,
  ],
  globals: [SiteSettings, ThemeColors],
  // Password resets and email verification for the author accounts. Without an adapter
  // Payload only logs them, so they never arrive, see src/lib/payload-email.ts.
  email: resendEmailAdapter(),
  /**
   * The upload node carries a display size, so an editor decides how wide a picture renders
   * instead of every image filling the column.
   *
   * "Automatycznie" is the default and works the size out from the file: it aims for double the
   * displayed width, which is what a 2x screen needs to look sharp. See `src/lib/image-display.ts`.
   */
  editor: lexicalEditor({
    features: ({ defaultFeatures }) => [
      ...defaultFeatures,
      UploadFeature({
        collections: {
          media: {
            fields: [
              {
                name: 'displaySize',
                type: 'select',
                label: 'Szerokość na stronie',
                defaultValue: 'auto',
                options: IMAGE_DISPLAY_OPTIONS.map((option) => ({ ...option })),
                admin: {
                  description:
                    'Zdjęcie nigdy nie jest rozciągane ponad własną rozdzielczość, więc wybór większy niż plik nic nie zmieni. Jeśli obraz wygląda na rozmyty, wybierz mniejszą szerokość.',
                },
              },
            ],
          },
        },
      }),
    ],
  }),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || '',
    },
    // No `push` override here on purpose. The adapter gates the dev-mode schema push on
    // `NODE_ENV !== 'production'` before it ever looks at the option, so a production
    // build cannot be talked into pushing. Migrations under `src/migrations/` are what
    // shapes a database that dev mode has not already touched.
  }),
  i18n: {
    fallbackLanguage: 'pl',
    supportedLanguages: { pl, en },
  },
  plugins: [
    nestedDocsPlugin({
      collections: ['pages'],
      generateLabel: (_, doc) => String(doc.title ?? ''),
      generateURL: (docs) =>
        docs.reduce((url, doc) => `${url}/${String(doc.slug ?? '')}`, ''),
    }),
  ],
  // sharp@0.35 types diverge slightly from Payload's SharpDependency expectation
  sharp: sharp as never,
})
