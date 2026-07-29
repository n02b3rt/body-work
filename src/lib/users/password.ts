const LOWER = 'abcdefghijklmnopqrstuvwxyz'
const UPPER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
const DIGITS = '0123456789'
const SPECIAL = '!@#$%^&*-_=+'
const ALL = LOWER + UPPER + DIGITS + SPECIAL

function randomInt(maxExclusive: number): number {
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const buf = new Uint32Array(1)
    crypto.getRandomValues(buf)
    return buf[0]! % maxExclusive
  }
  return Math.floor(Math.random() * maxExclusive)
}

function pick(charset: string): string {
  return charset[randomInt(charset.length)]!
}

function shuffle<T>(items: T[]): T[] {
  const arr = [...items]
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = randomInt(i + 1)
    ;[arr[i], arr[j]] = [arr[j]!, arr[i]!]
  }
  return arr
}

/**
 * Strong password: length chars, at least one lower, upper, digit and special.
 * Default length 20. Uses Web Crypto when available.
 */
export function generateStrongPassword(length = 20): string {
  const size = Math.max(length, 8)
  const required = [pick(LOWER), pick(UPPER), pick(DIGITS), pick(SPECIAL)]
  const rest: string[] = []
  for (let i = required.length; i < size; i += 1) {
    rest.push(pick(ALL))
  }
  return shuffle([...required, ...rest]).join('')
}
