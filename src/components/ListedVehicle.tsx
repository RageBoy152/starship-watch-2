"use client";

import { Vehicle } from "@/lib/types";
import { getVehicleStatusClass } from "@/lib/utils";
import { useGlobals } from "./ContextProviders/GlobalsProvider";
import { useEffect, useState } from "react";
import * as THREE from "three";

export default function ListedVehicle({ vehicle }: { vehicle: Vehicle }) {
  const { setActiveVehicle, transports } = useGlobals();

  const vehicleTransport = transports.find(transport => transport.vehicle_id == vehicle.id);
  const [vehicleTransportProgress, setVehicleTransportProgress] = useState(0);

  useEffect(() => {
    if (!vehicleTransport) {
      setVehicleTransportProgress(0);
      return;
    }

    const interval = setInterval(() => {
      const now = Date.now();
      const progress = THREE.MathUtils.clamp((now - vehicleTransport.start_time) / (vehicleTransport.end_time - vehicleTransport.start_time),0,1);
      setVehicleTransportProgress(progress);
    }, 100);

    return () => clearInterval(interval);
  }, [vehicleTransport]);

  return (
    <div className="grid grid-cols-2 items-center hover:bg-bg-secondary/50 cursor-pointer transition-colors py-2 px-4" onClick={() => setActiveVehicle(vehicle)}>
      <div className="font-consolas font-bold uppercase">
        <p className={`${getVehicleStatusClass(vehicle.status)} text-sm`}>{vehicle.status}</p>
        <p className="font-chakra font-medium text-xl -mb-1.5">{vehicle.type} {vehicle.serial_number}</p>
        <p className="text-label-secondary/75">{vehicleTransport!=undefined ? (vehicleTransportProgress==1?`Arrived at ${vehicleTransport.route.split("-")[1]}` : `${vehicleTransport.route.split("ROUTE_")[1].replace("-", " → ")}`) : (vehicle.location_preset??vehicle.location)}</p>
      </div>
      <div className="-my-4">
        <img className="w-full" src={`/vehicle-config-images/sides/${vehicle.vehicle_config}.png`} />
      </div>
    </div>
  );
}