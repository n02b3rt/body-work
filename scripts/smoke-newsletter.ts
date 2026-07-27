/**
 * Smoke test for the newsletter double opt-in, at the data layer.
 *
 * Run with: `pnpm payload run scripts/smoke-newsletter.ts`
 *
 * The HTTP flow is easy to check by hand with curl; what this covers is the part that is
 * not — that the collection's own rules hold. Namely: `create` really is closed to normal
 * access (the route handler's `overrideAccess` is not decoration), an address can't be
 * added twice, and the status transitions land the timestamps where the RODO consent record
 * needs them.
 *
 * Cleans up after itself, so it is safe to run against a database with real subscribers.
 */
import { getPayload } from 'payload'
import config from '@payload-config'

const TEST_EMAIL = 'smoke-newsletter@bodywork.invalid'

let failures = 0

function check(label: string, passed: boolean, detail = '') {
  console.log(`${passed ? '  ok  ' : '  FAIL'} ${label}${detail ? ` — ${detail}` : ''}`)
  if (!passed) failures += 1
}

const payload = await getPayload({ config })

// Leftovers from an interrupted run would make the create below fail on the unique index.
await payload.delete({
  collection: 'subscribers',
  where: { email: { equals: TEST_EMAIL } },
  overrideAccess: true,
})

console.log('\nnewsletter smoke test\n')

// 1. Public create must be refused. This is the whole reason the route handler exists.
let refused = false
try {
  await payload.create({
    collection: 'subscribers',
    data: { email: 'sneaky@bodywork.invalid', status: 'confirmed', locale: 'pl', token: 'x' },
    overrideAccess: false,
  })
} catch {
  refused = true
}
check('create is closed without overrideAccess', refused)

// 2. The route handler's own path.
const created = await payload.create({
  collection: 'subscribers',
  data: { email: TEST_EMAIL, status: 'pending', locale: 'pl', token: 'smoke-token-1' },
  overrideAccess: true,
})
check('pending subscriber created', created.status === 'pending', `status=${created.status}`)
check('nothing is confirmed on signup', !created.confirmedAt)

// 3. One address, one row.
let duplicateRefused = false
try {
  await payload.create({
    collection: 'subscribers',
    data: { email: TEST_EMAIL, status: 'pending', locale: 'pl', token: 'smoke-token-2' },
    overrideAccess: true,
  })
} catch {
  duplicateRefused = true
}
check('duplicate email refused by the unique index', duplicateRefused)

// 4. Confirming is what records consent.
const confirmed = await payload.update({
  collection: 'subscribers',
  id: created.id,
  data: { status: 'confirmed', confirmedAt: new Date().toISOString() },
  overrideAccess: true,
})
check('status becomes confirmed', confirmed.status === 'confirmed')
check('confirmedAt is recorded', Boolean(confirmed.confirmedAt))

// 5. Unsubscribing keeps the row — a deleted row would let the same address be re-added
//    silently, and loses the record that consent was once given and then withdrawn.
const unsubscribed = await payload.update({
  collection: 'subscribers',
  id: created.id,
  data: { status: 'unsubscribed', unsubscribedAt: new Date().toISOString() },
  overrideAccess: true,
})
check('status becomes unsubscribed', unsubscribed.status === 'unsubscribed')
check('unsubscribedAt is recorded', Boolean(unsubscribed.unsubscribedAt))
check('confirmedAt survives the unsubscribe', Boolean(unsubscribed.confirmedAt))

// 6. Only confirmed addresses are mailable — the query a future broadcast has to use.
const mailable = await payload.find({
  collection: 'subscribers',
  where: { status: { equals: 'confirmed' } },
  limit: 1000,
  overrideAccess: true,
})
check(
  'unsubscribed address is not in the mailable set',
  !mailable.docs.some((doc) => doc.email === TEST_EMAIL),
)

await payload.delete({
  collection: 'subscribers',
  where: { email: { equals: TEST_EMAIL } },
  overrideAccess: true,
})

const remaining = await payload.find({
  collection: 'subscribers',
  where: { email: { equals: TEST_EMAIL } },
  overrideAccess: true,
})
check('test data cleaned up', remaining.totalDocs === 0)

const total = await payload.count({ collection: 'subscribers', overrideAccess: true })
console.log(`\n${failures === 0 ? 'all checks passed' : `${failures} CHECK(S) FAILED`}`)
console.log(`real subscribers in the database: ${total.totalDocs}\n`)

process.exit(failures === 0 ? 0 : 1)
