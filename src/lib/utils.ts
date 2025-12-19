import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { GroupedLocation, POI, VehicleStatus } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function groupPOIsByLocation(pois: POI[]): GroupedLocation[] {
  const groups: Record<string, POI[]> = {};

  // Group by location string
  for (const poi of pois) {
    if (!groups[poi.location]) groups[poi.location] = [];
    groups[poi.location].push(poi);
  }

  // Convert groups to final structure
  return Object.keys(groups).map((location) => {
    const siteList = groups[location];

    const avgLat =
      siteList.reduce((sum, s) => sum + s.latitude, 0) / siteList.length;

    const avgLon =
      siteList.reduce((sum, s) => sum + s.longitude, 0) / siteList.length;

    return {
      location,
      latitude: avgLat,
      longitude: avgLon,
      sites: siteList,
    };
  });
}

export function getVehicleStatusClass(status: VehicleStatus) {
  switch (status) {
    case "active":
      return "text-success/75";
    case "manufacturing":
      return "text-orange/75";
    case "destroyed":
      return "text-danger/75";
    case "retired":
      return "text-label-secondary/75";
    default:
      return "";
  }
}

export function moveTowards(current: number, target: number, maxDelta: number) {
  const delta = target - current;
  if (Math.abs(delta) <= maxDelta) return target;
  return current + Math.sign(delta) * maxDelta;
}

export const clamp360 = (deg: number) => ((deg % 360) + 360) % 360;