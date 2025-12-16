import GlobeMap from "@/components/GlobeMap";
import { POI, Vehicle } from "@/lib/types";
import { createClient } from "@/utils/supabase/server";
import { UUID } from "crypto";

export const defaultPOI: POI = {
  id: "35281179-5ad4-43ab-b02b-ed65b1ee33a5" as UUID,
  name: "Loading...",
  type: "Production Site",
  location: "Space Coast, Florida, USA",
  longitude: -80.66773818318366,
  latitude: 28.543132193815936,
  file_name: "",
  config: {}
};

export const defaultVehicle: Vehicle = {
  id: "d3043b1c-8428-4838-aabf-b6151ea418c5" as UUID,
  position: { x: 0, y: 0, z: 0 },
  rotation: 0,
  type: "booster",
  serial_number: "19",
  status: "active",
  location: "Megabay 1",
  poi: "96dde332-05ea-49ca-8470-aab5eadd7685" as UUID,
  vehicle_config: "booster_v3",
  milestones: []
};

export default async function Home() {
  // would fetch POIs here
  const suapabse = await createClient();
  const { data: poisData, error: poisError } = await suapabse.from("pois").select();
  if (poisError || !poisData) {
    console.error(poisError);
  }

  const pois: POI[] = poisData ? (poisData as POI[]) : [];

  return (
    <GlobeMap pois={pois} />
  );
}