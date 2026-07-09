import { create } from "zustand"
import type { Location } from "@/features/locations/types"
import { supabase } from "@/services/supabase"

function fromRow(row: Record<string, unknown>): Location {
  return { id: row.id as string, nome: row.nome as string }
}

interface LocationsState {
  locations: Location[]
  fetchAll: () => Promise<void>
  addLocation: (nome: string) => Location
}

export const useLocationsStore = create<LocationsState>((set) => ({
  locations: [],
  fetchAll: async () => {
    const { data, error } = await supabase.from("locations").select("*").order("nome")
    if (error) {
      console.error("Failed to fetch locations", error)
      return
    }
    set({ locations: (data ?? []).map(fromRow) })
  },
  addLocation: (nome) => {
    const location: Location = { id: crypto.randomUUID(), nome }
    set((state) => ({ locations: [...state.locations, location] }))
    supabase
      .from("locations")
      .insert(location)
      .then(({ error }) => error && console.error("Failed to insert location", error))
    return location
  },
}))
