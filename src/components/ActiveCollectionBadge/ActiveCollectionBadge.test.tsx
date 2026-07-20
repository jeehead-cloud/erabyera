import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { loadBundledRuntimeData } from '../../data'
import { buildActiveCollectionPresentation } from '../../domain/collections'
import { ActiveCollectionBadge } from './ActiveCollectionBadge'

const dataset = loadBundledRuntimeData()
const viewport = { longitude: 28, latitude: 37, zoom: 3.5 }

function render(collectionId: string): string {
  const presentation = buildActiveCollectionPresentation(dataset, collectionId, -334, viewport)
  return renderToStaticMarkup(
    <MemoryRouter>
      <ActiveCollectionBadge presentation={presentation} selectedYear={-334} onReset={() => undefined} onLeave={() => undefined} />
    </MemoryRouter>,
  )
}

describe('F16 active collection badge', () => {
  it('renders collection context and distinct page, Reset, and Leave actions', () => {
    const markup = render('alexanders-world')
    expect(markup).toContain('Alexander’s World')
    expect(markup).toContain('334 BCE')
    expect(markup).toContain('foundation preview')
    expect(markup).toContain('Collection page')
    expect(markup).toContain('Reset to recommended view')
    expect(markup).toContain('Leave collection')
  })

  it('keeps an unresolved collection explicit and offers Clear', () => {
    const markup = render('missing-collection')
    expect(markup).toContain('Collection unavailable')
    expect(markup).toContain('URL has been preserved')
    expect(markup).toContain('Clear unavailable collection')
    expect(markup).not.toContain('Reset to recommended view')
  })
})
