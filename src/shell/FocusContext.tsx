import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'

export type FocusTarget =
  | { type: 'work'; entityId: number }
  | { type: 'trope'; entityId: number }
  | null

interface FocusContextValue {
  focus: FocusTarget
  setFocus: (target: FocusTarget) => void
  clearFocus: () => void
}

const FocusCtx = createContext<FocusContextValue>({
  focus: null,
  setFocus: () => {},
  clearFocus: () => {},
})

export function FocusProvider({ children }: { children: ReactNode }) {
  const [focus, setFocusState] = useState<FocusTarget>(null)

  const setFocus = useCallback((target: FocusTarget) => {
    setFocusState(target)
  }, [])

  const clearFocus = useCallback(() => {
    setFocusState(null)
  }, [])

  return (
    <FocusCtx.Provider value={{ focus, setFocus, clearFocus }}>
      {children}
    </FocusCtx.Provider>
  )
}

export function useFocus() {
  return useContext(FocusCtx)
}
