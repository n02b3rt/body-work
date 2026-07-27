import { postgresAdapter } from '@payloadcms/db-postgres'
import { nestedDocsPlugin } from '@payloadcms/plugin-nested-docs'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
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
import { Posts } from './collections/Posts'
import { Users } from './collections/Users'
import { SiteSettings } from './globals/SiteSettings'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const dashboardURL =
  process.env.NEXT_PUBLIC_DASHBOARD_URL || 'http://dash.localhost:3000'
const publicURL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'

export default buildConfig({
  serverURL: dashboardURL,
  csrf: [dashboardURL, publicURL],
  cors: [dashboardURL, publicURL],
  admin: {
    user: Users.slug,
    meta: {
      titleSuffix: '— BodyWork Panel',
    },
    importMap: {
      baseDir: path.resolve(dirname),
    },
    components: {
      Nav: '/components/admin/AdminNav#AdminNav',
      beforeDashboard: ['/components/admin/WelcomeDashboard#WelcomeDashboard'],
      views: {
        comingSoon: {
          Component: '/components/admin/ComingSoonView#ComingSoonView',
          path: '/coming-soon',
          meta: {
            title: 'W przygotowaniu',
          },
        },
      },
    },
  },
  collections: [Users, Authors, Categories, Media, Pages, Posts],
  globals: [SiteSettings],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || '',
    },
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
