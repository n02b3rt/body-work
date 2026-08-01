import type { CollectionConfig } from 'payload'

import { administrators, isStaff } from '@/access/roles'

/**
 * Newsletter subscribers: **the list lives here, in our own Postgres, not at Resend.**
 *
 * The PRD makes self-hosting the cardinal rule but already exempts the mail relay,
 * which is the right call: outbound mail depends on IP reputation nobody should try to
 * build themselves. So Resend delivers, and this collection owns the data. That keeps the
 * RODO consent record (token, timestamp, IP) somewhere we can actually produce on demand,
 * and turns a later move to Listmonk into an export rather than a migration: Listmonk
 * would have needed a relay underneath it anyway.
 *
 * `create` is deliberately closed to the API: the only way in is the route handler at
 * `/api/newsletter`, which runs the honeypot, the rate limit and the double opt-in before
 * writing with `overrideAccess`. Left open, Payload's REST endpoint would let anyone add
 * addresses straight to the list.
 */
export const Subscribers: CollectionConfig = {
  slug: 'subscribers',
  labels: {
    singular: 'Subskrybent',
    plural: 'Newsletter',
  },
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'status', 'locale', 'confirmedAt', 'createdAt'],
    group: 'Ustawienia',
    description:
      'Zapisy do newslettera. Wysyłkę obsługuje Resend, ale lista jest tutaj: status „Potwierdzony” oznacza kliknięcie linku w mailu (wymóg RODO).',
  },
  access: {
    // Personal data: staff only, and no public read even though posts and categories are open.
    read: ({ req: { user } }) => isStaff(user),
    create: () => false,
    update: administrators,
    delete: administrators,
  },
  fields: [
    {
      name: 'email',
      type: 'email',
      label: 'Adres e-mail',
      required: true,
      unique: true,
      index: true,
    },
    {
      name: 'status',
      type: 'select',
      label: 'Status',
      required: true,
      defaultValue: 'pending',
      index: true,
      options: [
        { label: 'Oczekuje potwierdzenia', value: 'pending' },
        { label: 'Potwierdzony', value: 'confirmed' },
        { label: 'Wypisany', value: 'unsubscribed' },
      ],
      admin: {
        description: 'Tylko „Potwierdzony” wolno wysyłać. Reszta to brak zgody.',
      },
    },
    {
      name: 'locale',
      type: 'select',
      label: 'Język',
      required: true,
      defaultValue: 'pl',
      options: [
        { label: 'Polski', value: 'pl' },
        { label: 'English', value: 'en' },
      ],
      admin: {
        description: 'Język, w którym zapisał się subskrybent: do segmentacji wysyłek.',
      },
    },
    {
      // Serves both the confirmation and the unsubscribe link, so it stays valid for the
      // lifetime of the subscription rather than being consumed on confirm.
      name: 'token',
      type: 'text',
      label: 'Token',
      required: true,
      index: true,
      admin: {
        readOnly: true,
        description: 'Losowy identyfikator z linków potwierdzenia i wypisu.',
      },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'confirmedAt',
          type: 'date',
          label: 'Potwierdzono',
          admin: { readOnly: true, width: '50%' },
        },
        {
          name: 'unsubscribedAt',
          type: 'date',
          label: 'Wypisano',
          admin: { readOnly: true, width: '50%' },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'source',
          type: 'text',
          label: 'Źródło',
          admin: {
            readOnly: true,
            width: '50%',
            description: 'Strona, z której przyszedł zapis.',
          },
        },
        {
          // Consent proof under RODO art. 7(1): kept alongside the timestamp so the pair
          // is defensible, not for tracking.
          name: 'consentIp',
          type: 'text',
          label: 'IP zgody',
          admin: { readOnly: true, width: '50%' },
        },
      ],
    },
  ],
  timestamps: true,
}
