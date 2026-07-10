import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { PEPTIDES } from './data'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [count, setCount] = useState(0)
  // The "active" peptide drives the hero 3D vial color + section accent.
  const [activeId, setActiveId] = useState(PEPTIDES[0].id)

  const add = useCallback((n = 1) => setCount((c) => c + n), [])
  const value = useMemo(() => {
    const active = PEPTIDES.find((p) => p.id === activeId) || PEPTIDES[0]
    return { count, add, activeId, setActiveId, active }
  }, [count, add, activeId])
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  return useContext(CartContext)
}
