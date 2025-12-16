import { UUID } from "crypto"

export type POITypes = "Launch Site" | "Production Site" | "Test Site"
export type POI = {
  id: UUID
  name: string
  type: POITypes
  location: string
  longitude: number
  latitude: number
  file_name: string
  config: Record<string, any>
  last_updated: string
}

export type GroupedLocation = {
  location: string
  latitude: number
  longitude: number
  sites: POI[]
}

export type VehicleStatus = "active" | "manufacturing" | "destroyed" | "retired"
export type VehicleMilestone = {
  name: string
  barrel: boolean
  complete: boolean
  complete_date?: string
}
export type Vehicle = {
  id: UUID
  position: {
    x: number
    y: number
    z: number
  }
  rotation: number
  type: "booster" | "ship"
  serial_number: string
  status: VehicleStatus
  location: string
  poi: UUID
  vehicle_config: ConfigName
  stand?: string
  milestones: VehicleMilestone[]
}

export const stands = {
  "booster_v3": ["bts_v3"],
  "booster_v2": [],
  "ship_v3": [],
}

export type ConfigName = "booster_v3" | "booster_v2" | "ship_v3"

export type Transport = {
  id: UUID
  route: string
  start_time: number
  end_time: number
  vehicle_id: UUID
}