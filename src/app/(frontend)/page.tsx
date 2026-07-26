import { getTranslations } from 'next-intl/server'

export default async function Home() {
  const t = await getTranslations('site')

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-24">
      <main className="flex max-w-xl flex-col items-center gap-4 text-center">
        <h1 className="text-4xl font-semibold tracking-tight text-zinc-900">{t('name')}</h1>
        <p className="text-lg text-zinc-600">{t('tagline')}</p>
      </main>
    </div>
  )
}
