import test from 'node:test'
import assert from 'node:assert/strict'

import { hostnameOf, siteForHost } from '../src/lib/site-host.ts'

test('the port and letter case never change which site a host is', () => {
  assert.equal(hostnameOf('Centrum.Localhost:3000'), 'centrum.localhost')
  assert.equal(siteForHost('CENTRUM.localhost:3000'), 'centrum')
  assert.equal(siteForHost('dash.localhost:3000'), 'dashboard')
})

test('configured hosts win over the local defaults', () => {
  const env = { dashboardHost: 'dash.body-work.pl', centrumHost: 'centrum.body-work.pl' }
  assert.equal(siteForHost('centrum.body-work.pl', env), 'centrum')
  assert.equal(siteForHost('dash.body-work.pl', env), 'dashboard')
  // The local default no longer counts once a real host is configured.
  assert.equal(siteForHost('centrum.localhost', env), 'hub')
})

test('anything unrecognised, including no host at all, is the hub', () => {
  assert.equal(siteForHost('body-work.pl'), 'hub')
  assert.equal(siteForHost('localhost:3000'), 'hub')
  assert.equal(siteForHost(null), 'hub')
  assert.equal(siteForHost(''), 'hub')
})
