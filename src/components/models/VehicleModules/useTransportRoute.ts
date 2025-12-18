"use client";

import { useGlobals } from "@/components/ContextProviders/GlobalsProvider";
import { Vehicle } from "@/lib/types";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";


type UseTransportRouteProps = {
  vehicle: Vehicle
  ref: React.RefObject<THREE.Object3D|null>
  yOffset?: number
  flipRotation?: boolean // flips y rotation by 180deg
}

export function useTransportRoute({ vehicle, ref, yOffset=0, flipRotation }: UseTransportRouteProps) {
  const { transports, routes } = useGlobals();

  const transport = transports.find(t => t.vehicle_id == vehicle.id);
  const route = transport ? routes[transport.route.toUpperCase()] : undefined;


  useFrame(() => {
    if (!route || !transport || !ref.current) return;
    
    const now = Date.now();
    const progress = THREE.MathUtils.clamp((now - transport.start_time) / (transport.end_time - transport.start_time), 0, 1);

    // position
    const point = route.getPointAt(progress);
    point.y = vehicle.position.y + yOffset;
    ref.current.position.copy(point);

    // rotation
    let tangent = route.getTangentAt(progress).normalize()
    if (flipRotation) tangent = tangent.multiplyScalar(-1);
    ref.current.lookAt(point.clone().add(tangent));
  });
}