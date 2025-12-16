import { UUID } from "crypto";
import { POI, Vehicle } from "./types";

// export const pois: POI[] = [
//   {
//     id: "cf98ff6e-c336-4b46-b510-32f436649730" as UUID,
//     name: "Launch Complex",
//     type: "Launch Site",
//     location: "Starbase, Texas, USA",
//     longitude: -97.15595204000228,
//     latitude: 25.996980099678076,
//     fileName: "SBLaunchSite"
//   },
//   {
//     id: "96dde332-05ea-49ca-8470-aab5eadd7685" as UUID,
//     name: "Production Site",
//     type: "Production Site",
//     location: "Starbase, Texas, USA",
//     longitude: -97.18504091312666,
//     latitude: 25.98945931379409,
//     fileName: "SBProductionSite"
//   },
//   {
//     id: "e0cd4c80-34eb-462d-8416-ff171abcd056" as UUID,
//     name: "Massey's Test Site",
//     type: "Test Site",
//     location: "Starbase, Texas, USA",
//     longitude: -97.24978730503445,
//     latitude: 25.952112623229638,
//     fileName: "SBMassey"
//   },
//   {
//     id: "c7795a91-df3b-4067-96af-d5f594f0220e" as UUID,
//     name: "Launch Complex 39A",
//     type: "Launch Site",
//     location: "Space Coast, Florida, USA",
//     longitude: -80.6040318261534,
//     latitude: 28.60847463720469,
//     fileName: "FLLC39A"
//   },
//   {
//     id: "457877be-1ca7-40b0-9370-a21204678cde" as UUID,
//     name: "Launch Complex 37",
//     type: "Launch Site",
//     location: "Space Coast, Florida, USA",
//     longitude: -80.56715508704056,
//     latitude: 28.53170935201455,
//     fileName: "FLLC37"
//   },
//   {
//     id: "428d3637-9113-48ba-bf5a-671c563def84" as UUID,
//     name: "Roberts Road Production Site",
//     type: "Production Site",
//     location: "Space Coast, Florida, USA",
//     longitude: -80.66773818318366,
//     latitude: 28.543132193815936,
//     fileName: "FLProductionSite"
//   },
// ];


export const vehicles: Vehicle[] = [
  {
    id: "1" as UUID,
    position: { x: 0, y: 0, z: 0 },
    rotation: 0,
    type: "booster",
    serial_number: "19",
    status: "manufacturing",
    location: "Megabay 1",
    poi: "0403e1dc-fe0e-401d-835e-092bbfde8772" as UUID,
    vehicle_config: "booster_v3",
    milestones: [
      {
        name: "fx:3",
        barrel: true,
        complete: false,
      },
      {
        name: "f2:4",
        barrel: true,
        complete: false,
      },
      {
        name: "f3:4",
        barrel: true,
        complete: false,
      },
      {
        name: "cx:3",
        barrel: true,
        complete: true,
        complete_date: "2025-11-26",
      },
      {
        name: "a2:4",
        barrel: true,
        complete: true,
        complete_date: "2025-11-25",
      },
      {
        name: "a3:4",
        barrel: true,
        complete: true,
        complete_date: "2025-11-28",
      },
      {
        name: "a4:4",
        barrel: true,
        complete: true,
        complete_date: "2025-11-30",
      },
      {
        name: "a5:4",
        barrel: true,
        complete: true,
        complete_date: "2025-12-02",
      },
      {
        name: "a6:4",
        barrel: true,
        complete: true,
        complete_date: "2025-12-04",
      },
      {
        name: "ax:2",
        barrel: true,
        complete: false,
      },
      {
        name: "ch4 landing tank",
        barrel: false,
        complete: true,
        complete_date: "2025-12-04",
      },
      {
        name: "transfer tube",
        barrel: false,
        complete: true,
        complete_date: "2025-12-06",
      },
      {
        name: "lox landing tank",
        barrel: false,
        complete: false,
      },
      {
        name: "final stack",
        barrel: false,
        complete: false,
      },
    ]
  }
]



type LocationPresets = {
  [poiId: string]: {
    [location: string]: {
      [sublocation: string]: { x: number; y: number; z: number, r?: number }
    }
  }
}

export const locationPresets: LocationPresets = {
  "0403e1dc-fe0e-401d-835e-092bbfde8772": {
    "megabay 2": {
      "bay 1": { x: -199, y: 6.90488, z: -10.6 },
      "bay 2": { x: -184.4, y: 6.90488, z: -10.6 },
      "bay 3": { x: -169.8, y: 6.90488, z: -10.6 },
      "bay 4": { x: -199, y: 6.90488, z: 4 },
      "bay 5": { x: -184.4, y: 0, z: 4 },
      "bay 6": { x: -169.8, y: 6.90488, z: 4 },
    }, // 15.75
    "megabay 1": {
      "bay 1": { x: -234.277, y: 8.5885, z: 99.5445 },
      "bay 2": { x: -234.277, y: 8.5885, z: 83.7945 },
      "bay 3": { x: -234.277, y: 8.5885, z: 68.0445 },
      "bay 4": { x: -216.35, y: 3.77062, z: 99.5445 },
      "bay 5": { x: -216.35, y: 0, z: 83.7945 },
      "bay 6": { x: -216.35, y: 3.77062, z: 68.0445 },
    }
  },
  "da41c0c8-7a89-4962-b190-ab0d8a634659": {
    "pad 2": {
      "Stacking Station": { x: -192.67414944075688, y: 0, z: 46.5511090875113, r: 90 },
      "OLM": { x: -208.761, y: 10.1417, z: 62.4059, r: 190 },
      "OLM Ship": { x: -208.761, y: 10.1417+68.8029, z: 62.4059, r: 10 },
    }
  }
}


type ChopstickPresets = {
  [name: string]: { c: number; l: number; r: number }
}
export const chopstickPresets: ChopstickPresets = {
  "Ship Open (Launch)": { c: 105, l: 40, r: 40 },
  "Ship Closed": { c: 105, l: 0, r: 0 },
  
  "Booster Open": { c: 63.5, l: 40, r: 40 },
  "Booster Closed": { c: 63.5, l: 0, r: 0 },
  
  "Ship Lift Partial open": { c: 24, l: 79.3, r: -71.3 },
  "Ship Lift Closed": { c: 24, l: 75.3, r: -75.3 },
  
  "Booster Lift Partial open": { c: 54, l: 79.3, r: -71.3 },
  "Booster Lift Closed": { c: 54, l: 75.3, r: -75.3 },
  
  "OLM Open": { c: 24, l: 40, r: 40 },
  "OLM Closed": { c: 24, l: 0, r: 0 },
}