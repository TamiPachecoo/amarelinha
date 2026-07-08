import { create } from "zustand"
import type { Location } from "@/features/locations/types"

const seedLocations: Location[] = [
  { id: "loc-prateleira-1", nome: "Prateleira 1" },
  { id: "loc-prateleira-2", nome: "Prateleira 2" },
  { id: "loc-prateleira-3", nome: "Prateleira 3" },
  { id: "loc-arara-a", nome: "Arara A" },
  { id: "loc-arara-b", nome: "Arara B" },
  { id: "loc-deposito", nome: "Depósito" },
  { id: "loc-mesa-promocao", nome: "Mesa Promoção" },
]

interface LocationsState {
  locations: Location[]
  addLocation: (nome: string) => Location
}

export const useLocationsStore = create<LocationsState>((set) => ({
  locations: seedLocations,
  addLocation: (nome) => {
    const location: Location = { id: crypto.randomUUID(), nome }
    set((state) => ({ locations: [...state.locations, location] }))
    return location
  },
}))
