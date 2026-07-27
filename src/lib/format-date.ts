/** BCP 47 locale for all user-facing date/time display in Poland. */
export const DISPLAY_LOCALE = 'pl-PL'

/** Date only: `DD.MM.YYYY` (e.g. 26.07.2026). */
export const PAYLOAD_DATE_FORMAT = 'dd.MM.yyyy'

/** Date and time: `DD.MM.YYYY, HH:MM` (24-hour). */
export const PAYLOAD_DATETIME_FORMAT = 'dd.MM.yyyy, HH:mm'

/** Time only: `HH:MM` (24-hour). */
export const PAYLOAD_TIME_FORMAT = 'HH:mm'

const intlDateOptions = {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
} as const satisfies Intl.DateTimeFormatOptions

const intlDateTimeOptions = {
  ...intlDateOptions,
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
} as const satisfies Intl.DateTimeFormatOptions

const intlDateTimeWithSecondsOptions = {
  ...intlDateTimeOptions,
  second: '2-digit',
} as const satisfies Intl.DateTimeFormatOptions

/** Presets for next-intl `useFormatter().dateTime()` / `getFormatter()`. */
export const intlFormats = {
  dateTime: {
    date: intlDateOptions,
    dateTime: intlDateTimeOptions,
    dateTimeSeconds: intlDateTimeWithSecondsOptions,
  },
} as const

const dateFormatter = new Intl.DateTimeFormat(DISPLAY_LOCALE, intlDateOptions)
const dateTimeFormatter = new Intl.DateTimeFormat(DISPLAY_LOCALE, intlDateTimeOptions)
const dateTimeWithSecondsFormatter = new Intl.DateTimeFormat(
  DISPLAY_LOCALE,
  intlDateTimeWithSecondsOptions,
)

export function parseDisplayDate(
  input: string | Date | number | null | undefined,
): Date | null {
  if (input == null) return null
  const date = input instanceof Date ? input : new Date(input)
  return Number.isNaN(date.getTime()) ? null : date
}

/** Format as `DD.MM.YYYY`. Returns empty string for invalid/missing input. */
export function formatDatePl(input: string | Date | number | null | undefined): string {
  const date = parseDisplayDate(input)
  if (!date) return ''
  return dateFormatter.format(date)
}

/** Format as `DD.MM.YYYY, HH:MM` (24-hour). Returns empty string for invalid/missing input. */
export function formatDateTimePl(input: string | Date | number | null | undefined): string {
  const date = parseDisplayDate(input)
  if (!date) return ''
  return dateTimeFormatter.format(date)
}

/** Format as `DD.MM.YYYY, HH:MM:SS` (24-hour). Returns empty string for invalid/missing input. */
export function formatDateTimeWithSecondsPl(
  input: string | Date | number | null | undefined,
): string {
  const date = parseDisplayDate(input)
  if (!date) return ''
  return dateTimeWithSecondsFormatter.format(date)
}
