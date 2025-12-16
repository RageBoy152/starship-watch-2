"use client";

import { Vehicle } from "@/lib/types";
import { getVehicleStatusClass } from "@/lib/utils";
import { useGlobals } from "./ContextProviders/GlobalsProvider";

export default function ListedVehicle({ vehicle }: { vehicle: Vehicle }) {
  const { setActiveVehicle, transports } = useGlobals();

  return (
    <div className="grid grid-cols-2 items-center hover:bg-bg-secondary/50 cursor-pointer transition-colors py-2 px-4" onClick={() => setActiveVehicle(vehicle)}>
      <div className="font-consolas font-bold uppercase">
        <p className={`${getVehicleStatusClass(vehicle.status)} text-sm`}>{vehicle.status}</p>
        <p className="font-chakra font-medium text-xl -mb-1.5">{vehicle.type} {vehicle.serial_number}</p>
        <p className="text-label-secondary/75">{transports.find(transport => transport.vehicle_id == vehicle.id) ? "In Transport" : vehicle.location}</p>
      </div>
      <div className="-my-4">
        <img className="w-full" src={`/vehicle-config-images/sides/${vehicle.vehicle_config}.png`} />
      </div>
    </div>
  );
}