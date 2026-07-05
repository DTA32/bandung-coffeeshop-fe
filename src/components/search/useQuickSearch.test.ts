import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, renderHook } from '@/test/utils'
import type { QuickSearchItem } from '@/lib/api/search'

import { quickSearch } from '@/lib/api/search'
import { mockNavigate, resetRouter, setMockPathname } from '@/test/router'
import { optionKey, useQuickSearch } from './useQuickSearch'

// The API module is mocked so the hook's debounced fetch never hits the network;
// we drive its resolved value per test and assert call counts/args.
vi.mock('@/lib/api/search', () => ({ quickSearch: vi.fn() }))

// The hook reads useNavigate + useLocale (which reads useRouterState), so the
// router surface must be stubbed.
vi.mock('@tanstack/react-router', async (importActual) => {
  const actual = await importActual<typeof import('@tanstack/react-router')>()
  const { routerOverrides } = await import('@/test/router')
  return { ...actual, ...routerOverrides }
})

const asMock = (fn: unknown) => fn as ReturnType<typeof vi.fn>

beforeEach(() => {
  vi.useFakeTimers()
  resetRouter()
  asMock(quickSearch).mockReset()
  asMock(quickSearch).mockResolvedValue([])
})

afterEach(() => {
  vi.useRealTimers()
})

// Renders the hook, types `query` (handleChange flips the internal cancelledRef
// so the debounced effect is allowed to fire), then flushes the 300ms debounce.
async function openWith(items: QuickSearchItem[], query = 'da') {
  asMock(quickSearch).mockResolvedValue(items)
  const hook = renderHook(() => useQuickSearch(''))
  act(() => {
    hook.result.current.handleChange(query)
  })
  await act(async () => {
    await vi.advanceTimersByTimeAsync(300)
  })
  return hook
}

const keyEvent = (key: string, preventDefault = vi.fn()) =>
  ({ key, preventDefault }) as unknown as React.KeyboardEvent

describe('optionKey', () => {
  it('namespaces the key by type then id', () => {
    expect(optionKey({ id: '42', name: 'X', type: 'cafe' })).toBe('cafe-42')
    expect(optionKey({ id: 'abc', name: 'Y', type: 'filter' })).toBe(
      'filter-abc',
    )
  })
})

describe('useQuickSearch — debounced fetching', () => {
  it('does not fetch when the query is shorter than 2 characters', async () => {
    const hook = renderHook(() => useQuickSearch(''))
    act(() => {
      hook.result.current.handleChange('d')
    })
    await act(async () => {
      await vi.advanceTimersByTimeAsync(300)
    })
    expect(quickSearch).not.toHaveBeenCalled()
    expect(hook.result.current.isOpen).toBe(false)
    expect(hook.result.current.results).toEqual([])
  })

  it('does not fetch on mount even when initialQuery is long enough', async () => {
    const hook = renderHook(() => useQuickSearch('cafe'))
    await act(async () => {
      await vi.advanceTimersByTimeAsync(300)
    })
    // query === initialQuery on mount, so the effect never schedules a fetch.
    expect(quickSearch).not.toHaveBeenCalled()
    expect(hook.result.current.query).toBe('cafe')
    expect(hook.result.current.isOpen).toBe(false)
  })

  it('debounces and calls quickSearch exactly once after 300ms, then opens', async () => {
    asMock(quickSearch).mockResolvedValue([
      { id: 'a', name: 'A', type: 'cafe' },
    ])
    const hook = renderHook(() => useQuickSearch(''))
    act(() => {
      hook.result.current.handleChange('da')
    })
    // Not yet — the debounce window has not elapsed.
    await act(async () => {
      await vi.advanceTimersByTimeAsync(299)
    })
    expect(quickSearch).not.toHaveBeenCalled()
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1)
    })
    expect(quickSearch).toHaveBeenCalledTimes(1)
    // locale is 'en' because the mock pathname defaults to '/en'.
    expect(quickSearch).toHaveBeenCalledWith('da', 'en')
    expect(hook.result.current.isOpen).toBe(true)
    expect(hook.result.current.results).toHaveLength(1)
  })

  it('coalesces rapid keystrokes into a single fetch for the latest value', async () => {
    asMock(quickSearch).mockResolvedValue([
      { id: 'a', name: 'A', type: 'cafe' },
    ])
    const hook = renderHook(() => useQuickSearch(''))
    act(() => {
      hook.result.current.handleChange('da')
    })
    await act(async () => {
      await vi.advanceTimersByTimeAsync(150)
    })
    act(() => {
      hook.result.current.handleChange('dan')
    })
    await act(async () => {
      await vi.advanceTimersByTimeAsync(300)
    })
    expect(quickSearch).toHaveBeenCalledTimes(1)
    expect(quickSearch).toHaveBeenCalledWith('dan', 'en')
  })

  it('stays closed when the search returns no items', async () => {
    asMock(quickSearch).mockResolvedValue([])
    const hook = renderHook(() => useQuickSearch(''))
    act(() => {
      hook.result.current.handleChange('da')
    })
    await act(async () => {
      await vi.advanceTimersByTimeAsync(300)
    })
    expect(quickSearch).toHaveBeenCalledTimes(1)
    expect(hook.result.current.isOpen).toBe(false)
    expect(hook.result.current.results).toEqual([])
  })
})

describe('useQuickSearch — grouping', () => {
  it('groups results by type and indexes them location-first, filter-last', async () => {
    const items: QuickSearchItem[] = [
      { id: '1', name: 'Filter One', type: 'filter' },
      { id: '2', name: 'District Two', type: 'district' },
      { id: '3', name: 'Cafe Three', type: 'cafe' },
      { id: '4', name: 'Area Four', type: 'area' },
      { id: '5', name: 'Cafe Five', type: 'cafe' },
      { id: '6', name: 'Poi Six', type: 'poi' },
    ]
    const hook = await openWith(items)

    // groupOrder is the LOCATION_SHORT_LABELS keys followed by 'filter'.
    expect(hook.result.current.groupOrder).toEqual([
      'cafe',
      'poi',
      'area',
      'district',
      'filter',
    ])
    expect(hook.result.current.grouped.cafe).toEqual([items[2], items[4]])
    expect(hook.result.current.grouped.poi).toEqual([items[5]])
    expect(hook.result.current.grouped.area).toEqual([items[3]])
    expect(hook.result.current.grouped.district).toEqual([items[1]])
    expect(hook.result.current.grouped.filter).toEqual([items[0]])

    // Flattened indices follow groupOrder, preserving in-group order.
    expect(hook.result.current.optionIndexByKey).toEqual({
      'cafe-3': 0,
      'cafe-5': 1,
      'poi-6': 2,
      'area-4': 3,
      'district-2': 4,
      'filter-1': 5,
    })
  })
})

describe('useQuickSearch — keyboard navigation', () => {
  const twoItems: QuickSearchItem[] = [
    { id: 'a', name: 'A', type: 'cafe' },
    { id: 'b', name: 'B', type: 'cafe' },
  ]

  it('ignores arrow keys while the dropdown is closed', () => {
    const hook = renderHook(() => useQuickSearch(''))
    const preventDefault = vi.fn()
    act(() => {
      hook.result.current.handleKeyDown(keyEvent('ArrowDown', preventDefault))
    })
    expect(hook.result.current.activeIndex).toBe(-1)
    expect(preventDefault).not.toHaveBeenCalled()
  })

  it('ArrowDown advances then wraps to the first option', async () => {
    const hook = await openWith(twoItems)
    expect(hook.result.current.activeIndex).toBe(-1)

    const preventDefault = vi.fn()
    act(() => {
      hook.result.current.handleKeyDown(keyEvent('ArrowDown', preventDefault))
    })
    expect(hook.result.current.activeIndex).toBe(0)
    expect(preventDefault).toHaveBeenCalledTimes(1)

    act(() => {
      hook.result.current.handleKeyDown(keyEvent('ArrowDown'))
    })
    expect(hook.result.current.activeIndex).toBe(1)

    act(() => {
      hook.result.current.handleKeyDown(keyEvent('ArrowDown'))
    })
    // Past the last option → wraps back to 0.
    expect(hook.result.current.activeIndex).toBe(0)
  })

  it('ArrowUp from the first option wraps to the last', async () => {
    const hook = await openWith(twoItems)
    act(() => {
      hook.result.current.handleKeyDown(keyEvent('ArrowDown'))
    })
    expect(hook.result.current.activeIndex).toBe(0)
    act(() => {
      hook.result.current.handleKeyDown(keyEvent('ArrowUp'))
    })
    expect(hook.result.current.activeIndex).toBe(1)
  })

  it('exposes activeOptionId for the focused option only', async () => {
    const hook = await openWith(twoItems)
    expect(hook.result.current.activeOptionId).toBeUndefined()
    act(() => {
      hook.result.current.handleKeyDown(keyEvent('ArrowDown'))
    })
    expect(hook.result.current.activeOptionId).toBe(
      `${hook.result.current.listboxId}-option-cafe-a`,
    )
  })

  it('Escape closes the dropdown and clears the active option', async () => {
    const hook = await openWith(twoItems)
    act(() => {
      hook.result.current.handleKeyDown(keyEvent('ArrowDown'))
    })
    expect(hook.result.current.activeIndex).toBe(0)
    act(() => {
      hook.result.current.handleKeyDown(keyEvent('Escape'))
    })
    expect(hook.result.current.isOpen).toBe(false)
    expect(hook.result.current.activeIndex).toBe(-1)
  })
})

describe('useQuickSearch — Enter handling', () => {
  it('Enter clicks the focused item via its ref', async () => {
    const hook = await openWith([
      { id: 'a', name: 'A', type: 'cafe' },
      { id: 'b', name: 'B', type: 'cafe' },
    ])
    // Move focus onto index 0.
    act(() => {
      hook.result.current.handleKeyDown(keyEvent('ArrowDown'))
    })
    expect(hook.result.current.activeIndex).toBe(0)

    // itemRefs.current is wiped on every render, so seed the stub immediately
    // before dispatching Enter (which performs no state change → no re-render).
    const click = vi.fn()
    hook.result.current.itemRefs.current[0] = { click } as never
    const preventDefault = vi.fn()
    hook.result.current.handleKeyDown(keyEvent('Enter', preventDefault))

    expect(click).toHaveBeenCalledTimes(1)
    expect(preventDefault).toHaveBeenCalledTimes(1)
    expect(mockNavigate).not.toHaveBeenCalled()
  })

  it('Enter without an active option runs a search navigation', async () => {
    const hook = await openWith([{ id: 'a', name: 'A', type: 'cafe' }])
    expect(hook.result.current.activeIndex).toBe(-1)
    act(() => {
      hook.result.current.handleKeyDown(keyEvent('Enter'))
    })
    expect(mockNavigate).toHaveBeenCalledTimes(1)
    // handleSearch also dismisses the dropdown.
    expect(hook.result.current.isOpen).toBe(false)
  })
})

describe('useQuickSearch — dismiss & navigation', () => {
  it('dismiss closes the dropdown and clears results', async () => {
    const hook = await openWith([{ id: 'a', name: 'A', type: 'cafe' }])
    expect(hook.result.current.isOpen).toBe(true)
    act(() => {
      hook.result.current.dismiss()
    })
    expect(hook.result.current.isOpen).toBe(false)
    expect(hook.result.current.results).toEqual([])
    expect(hook.result.current.activeIndex).toBe(-1)
  })

  it('handleSearch navigates to the explore route with the en locale param', () => {
    const hook = renderHook(() => useQuickSearch(''))
    act(() => {
      hook.result.current.handleSearch()
    })
    expect(mockNavigate).toHaveBeenCalledWith({
      to: '/{-$locale}/explore',
      params: { locale: 'en' },
      search: {},
    })
  })

  it('handleSearch omits the locale param for the id locale', () => {
    setMockPathname('/')
    const hook = renderHook(() => useQuickSearch(''))
    act(() => {
      hook.result.current.handleSearch()
    })
    expect(mockNavigate).toHaveBeenCalledWith({
      to: '/{-$locale}/explore',
      params: { locale: undefined },
      search: {},
    })
  })
})
