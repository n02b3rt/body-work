/**
 * Checks the rules that decide how wide an in-article image renders.
 *
 * Run with: `pnpm payload run scripts/smoke-image-display.ts`
 *
 * Pure functions, so this needs no database, but it goes through `payload run` because that is
 * the runner in this project that resolves the `@/` alias and TypeScript.
 *
 * Two behaviours worth locking down. **A translation follows the Polish version's choice for the
 * same file**, so the two languages cannot disagree about how big a photograph is, while a
 * different file in the translation keeps its own. And **nothing is ever upscaled**, whatever an
 * editor picks, because upscaling is what left 75 of the 150 in-article images mushy.
 */
import { collectDisplaySizes, resolveDisplayWidth, takeSyncedSize } from '@/lib/image-display'

const body = (uploads: { id: number; size?: string }[]) => ({
  root: {
    type: 'root',
    children: uploads.map((u) => ({
      type: 'upload',
      value: { id: u.id },
      fields: u.size ? { displaySize: u.size } : {},
    })),
  },
})

let failures = 0
const check = (label: string, actual: unknown, expected: unknown) => {
  const ok = JSON.stringify(actual) === JSON.stringify(expected)
  if (!ok) failures += 1
  console.log(`${ok ? '  ok  ' : '  FAIL'} ${label}  got=${JSON.stringify(actual)} want=${JSON.stringify(expected)}`)
}

// The Polish body sets one image to `large`.
const pl = collectDisplaySizes(body([{ id: 4, size: 'large' }]))
check('same file follows the Polish choice', takeSyncedSize(pl, 4), 'large')

// A different file in the translation is not in the map, so it keeps its own.
const pl2 = collectDisplaySizes(body([{ id: 4, size: 'large' }]))
check('a different file is not synced', takeSyncedSize(pl2, 129), null)

// The same file twice, at different sizes, pairs up in order.
const pl3 = collectDisplaySizes(body([{ id: 7, size: 'small' }, { id: 7, size: 'full' }]))
check('first use of a repeated file', takeSyncedSize(pl3, 7), 'small')
check('second use of a repeated file', takeSyncedSize(pl3, 7), 'full')
check('third use has nothing left', takeSyncedSize(pl3, 7), null)

// No Polish body at all, e.g. rendering the Polish page itself.
check('no map means no sync', takeSyncedSize(null, 4), null)

// Never upscale, whatever was chosen.
check('full on a 400px file stays 400', resolveDisplayWidth('full', 400), 400)
check('large on a 1024px file is 1024', resolveDisplayWidth('large', 1024), 1024)
check('auto on a 1024px file picks 480', resolveDisplayWidth('auto', 1024), 480)
check('auto on a 2047px file picks 720', resolveDisplayWidth('auto', 2047), 720)
check('auto on a 196px file keeps 196', resolveDisplayWidth('auto', 196), 196)
check('auto on a 3000px file picks 1376', resolveDisplayWidth('auto', 3000), 1376)

console.log(failures === 0 ? '\nall checks passed' : `\n${failures} CHECK(S) FAILED`)
process.exit(failures === 0 ? 0 : 1)
