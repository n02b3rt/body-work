import { getRequestConfig } from 'next-intl/server'

import { intlFormats } from '@/lib/format-date'

import { routing } from './routing'

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale

  if (!locale || !routing.locales.includes(locale as 'pl' | 'en')) {
    locale = routing.defaultLocale
  }

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
    formats: intlFormats,
  }
})
