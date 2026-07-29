/** Map Polish (and common Latin) diacritics to ASCII, then keep [a-z0-9] only. */
const DIACRITICS: Record<string, string> = {
  ą: 'a',
  ć: 'c',
  ę: 'e',
  ł: 'l',
  ń: 'n',
  ó: 'o',
  ś: 's',
  ź: 'z',
  ż: 'z',
  ä: 'a',
  ö: 'o',
  ü: 'u',
  ß: 'ss',
  à: 'a',
  á: 'a',
  â: 'a',
  ã: 'a',
  è: 'e',
  é: 'e',
  ê: 'e',
  ë: 'e',
  ì: 'i',
  í: 'i',
  î: 'i',
  ï: 'i',
  ò: 'o',
  ô: 'o',
  õ: 'o',
  ù: 'u',
  ú: 'u',
  û: 'u',
  ý: 'y',
  ÿ: 'y',
  č: 'c',
  ď: 'd',
  ě: 'e',
  ň: 'n',
  ř: 'r',
  š: 's',
  ť: 't',
  ů: 'u',
  ž: 'z',
}

export function stripPolish(input: string): string {
  const lower = input.trim().toLowerCase()
  let out = ''
  for (const char of lower) {
    if (DIACRITICS[char]) {
      out += DIACRITICS[char]
      continue
    }
    if (char >= 'a' && char <= 'z') {
      out += char
      continue
    }
    if (char >= '0' && char <= '9') {
      out += char
    }
  }
  return out
}
