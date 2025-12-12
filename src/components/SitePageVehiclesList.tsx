"use client";

import Section from "./UI/section";
import ListedVehicle from "./ListedVehicle";
import { useGlobals } from "./ContextProviders/GlobalsProvider";

export default function SitePageVehiclesList() {
  const { poiVehicles } = useGlobals();

  return (
    <Section className="p-0 py-2 gap-0">
      {poiVehicles.map(vehicle => <ListedVehicle vehicle={vehicle} key={vehicle.id} />)}
      {poiVehicles.length == 0 && <p className="text-center font-consolas font-bold uppercase text-label-secondary/75">No vehicles here</p>}
    </Section>
  );
}