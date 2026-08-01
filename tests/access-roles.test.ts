import test from 'node:test'
import assert from 'node:assert/strict'

import {
  administrators,
  administratorsField,
  anyone,
  authenticated,
  canAccessAdmin,
  getUserRole,
  isAdministrator,
  isEdytor,
  isStaff,
  staff,
} from '../src/access/roles.ts'

/** Payload passes access functions an args object; these read only `req.user`. */
const as = (user: unknown) => ({ req: { user } }) as never

const admin = { id: 1, role: 'administrator' }
const edytor = { id: 2, role: 'edytor' }
const klient = { id: 3, role: 'klient' }

test('getUserRole returns null for an anonymous or role-less user', () => {
  assert.equal(getUserRole(null), null)
  assert.equal(getUserRole(undefined), null)
  assert.equal(getUserRole({ id: 1 }), null)
  assert.equal(getUserRole({ id: 1, role: null }), null)
})

test('the three role predicates do not overlap', () => {
  assert.ok(isAdministrator(admin))
  assert.ok(!isAdministrator(edytor))
  assert.ok(!isAdministrator(klient))

  assert.ok(isEdytor(edytor))
  assert.ok(!isEdytor(admin))
  assert.ok(!isEdytor(klient))
})

test('staff is administrator or edytor, and never a client', () => {
  assert.ok(isStaff(admin))
  assert.ok(isStaff(edytor))
  assert.ok(!isStaff(klient))
  assert.ok(!isStaff(null))
})

test('a client can never reach the admin panel', () => {
  // The gate that keeps /admin staff-only. If this ever returns true for a
  // client, every collection's default access is wrong at once.
  assert.equal(canAccessAdmin(as(klient)), false)
  assert.equal(canAccessAdmin(as(null)), false)
  assert.equal(canAccessAdmin(as(admin)), true)
  assert.equal(canAccessAdmin(as(edytor)), true)
})

test('a retired or misspelled role grants nothing', () => {
  // Rows written before the 2026-07-29 rename still carry these. They must fall
  // through to "no access", never to a default of staff.
  for (const role of ['redaktor', 'moderator', 'Administrator', '', 'ADMIN']) {
    const user = { id: 9, role }
    assert.equal(isStaff(user), false, role)
    assert.equal(isAdministrator(user), false, role)
    assert.equal(canAccessAdmin(as(user)), false, role)
  }
})

test('anyone is open, authenticated only needs a session', () => {
  assert.equal(anyone(as(null)), true)
  assert.equal(authenticated(as(null)), false)
  assert.equal(authenticated(as(klient)), true)
})

test('the administrator-only gates admit nobody else', () => {
  assert.equal(administrators(as(admin)), true)
  assert.equal(administrators(as(edytor)), false)
  assert.equal(administratorsField(as(admin)), true)
  assert.equal(administratorsField(as(edytor)), false)
  assert.equal(staff(as(edytor)), true)
  assert.equal(staff(as(klient)), false)
})
