import { create } from "zustand"

interface DiagnosticsState {
  lastSuccessfulInventoryRefresh: string | null
  setLastSuccessfulInventoryRefresh: (value: string | null) => void
}

export const useDiagnosticsStore = create<DiagnosticsState>((set) => ({
  lastSuccessfulInventoryRefresh: null,
  setLastSuccessfulInventoryRefresh: (value) => set({ lastSuccessfulInventoryRefresh: value }),
}))
