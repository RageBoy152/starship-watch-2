"use client";

import { useGlobals } from "@/components/ContextProviders/GlobalsProvider";
import { Vehicle } from "@/lib/types";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { lerp } from "three/src/math/MathUtils.js";


function getClosestTOnCurve(curve: THREE.Curve<THREE.Vector3>, point: THREE.Vector3) {
  let closestT = 0;
  let minDistSq = Infinity;
  const samples = 400;

  for (let i = 0; i <= samples; i++) {
    const t = i / samples;
    const p = curve.getPointAt(t);
    const d = p.distanceToSquared(point);

    if (d < minDistSq) {
      minDistSq = d;
      closestT = t;
    }
  }

  return closestT;
}



type UseTransportRouteProps = {
  vehicle: Vehicle
  ref: React.RefObject<THREE.Object3D|null>
  yOffset?: number
  flipRotation?: boolean // flips y rotation by 180deg
}

export function useTransportRoute({ vehicle, ref, yOffset=0, flipRotation }: UseTransportRouteProps) {
  const { transports, routes } = useGlobals();
  const startTRef = useRef<number | null>(null);

  const transport = transports.find(t => t.vehicle_id == vehicle.id);
  const route = transport ? routes[transport.route.toUpperCase()] : undefined;


  useFrame(() => {
    if (!ref.current) return;
    if (!route || !transport) { startTRef.current = null; return; }
    

    // find entry point on the path
    if (startTRef.current === null) {
      const worldPos = ref.current.getWorldPosition(new THREE.Vector3());
      startTRef.current = getClosestTOnCurve(route, worldPos);
    }


    // get progress
    const now = Date.now();
    const rawProgress = THREE.MathUtils.clamp((now - transport.start_time) / (transport.end_time - transport.start_time), 0, 1);
    const startT = startTRef.current ?? 0;
    const progress = lerp(startT, 1, rawProgress);


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